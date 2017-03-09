import Backoff from 'backo';
import invariant from 'invariant';
import identity from 'lodash.identity';
import includes from 'lodash.includes';
import superagent from 'superagent';

import {
    requestStart,
    requestFailure,
    requestSuccess,
    mutateStart,
    mutateFailure,
    mutateSuccess,
} from '../actions';
import * as actionTypes from '../constants/action-types';
import * as httpMethods from '../constants/http-methods';
import * as statusCodes from '../constants/status-codes';
import { reconcileQueryKey } from '../lib/query-key';
import { Map, fromJS } from 'immutable';

const createRequest = (url, method) => {
    let request;
    switch (method) {
        case httpMethods.GET:
            request = superagent.get(url);
            break;
        case httpMethods.POST:
            request = superagent.post(url);
            break;
        case httpMethods.PUT:
            request = superagent.put(url);
            break;
        case httpMethods.DELETE:
            request = superagent.del(url);
            break;
        default:
            throw new Error(`Unsupported HTTP method: ${method}`);
    }

    return request;
};

const updateEntities = (update, entities = Map(), transformed = Map()) => {
    // If update, not supplied, then no change to entities should be made
    return Object.keys(update || {}).reduce((accum, key) => {
        return accum.set(key, update[key](entities.get(key), transformed.get(key)));
    }, new Map());
};

const optimisticUpdateEntities = (optimisticUpdate, entities = Map()) => {
    return Object.keys(optimisticUpdate).reduce((accum, key) => {
        if (optimisticUpdate[key]) {
            return accum.set(key, optimisticUpdate[key](entities.get(key)));
        }
        return accum.set(key, entities.get(key));
    }, new Map());
};

const defaultConfig = {
    backoff: {
        maxAttempts: 5,
        minDuration: 300,
        maxDuration: 5000,
    },
    retryableStatusCodes: [
        statusCodes.UNKNOWN, // normally means a failed connection
        statusCodes.REQUEST_TIMEOUT,
        statusCodes.TOO_MANY_REQUESTS, // hopefully backoff stops this getting worse
        statusCodes.SERVICE_UNAVAILABLE,
        statusCodes.GATEWAY_TIMEOUT,
    ],
};

const getPendingQueries = (queries) => {
    return queries.filter((query) => query.get('isPending'));
};

const queryMiddleware = (queriesSelector, entitiesSelector, config = defaultConfig) => {
    return ({ dispatch, getState }) => (next) => (action) => {
        // TODO(ryan): add warnings when there are simultaneous requests and mutation queries for the same entities
        let returnValue;

        switch (action.type) {
            case actionTypes.REQUEST_ASYNC: {
                const {
                    url,
                    body,
                    force,
                    retry,
                    transform = identity,
                    update,
                    options = {},
                    meta,
                } = action;

                invariant(!!url, 'Missing required `url` field in action handler');
                invariant(!!update, 'Missing required `update` field in action handler');

                const queryKey = reconcileQueryKey(action);

                const state = getState();
                const queries = queriesSelector(state);
                const queriesState = queries.get(queryKey, new Map());
                const isPending = queriesState.get('isPending');
                const status = queriesState.get('status');
                const hasSucceeded = status >= 200 && status < 300;

                if (force || queriesState.isEmpty() || (retry && !isPending && !hasSucceeded)) {
                    returnValue = new Promise(
                        (resolve) => {
                            const start = new Date();
                            const { method = httpMethods.GET } = options;

                            const request = createRequest(url, method);

                            if (body) {
                                request.send(body);
                            }

                            if (options.headers) {
                                request.set(options.headers);
                            }

                            if (options.credentials === 'include') {
                                request.withCredentials();
                            }

                            let attempts = 0;
                            const backoff = new Backoff({
                                min: config.backoff.minDuration,
                                max: config.backoff.maxDuration,
                            });

                            const attemptRequest = () => {
                                dispatch(requestStart(url, body, request, meta, queryKey));
                                attempts += 1;
                                request.end((err, response) => {
                                    const resOk = !!(response && response.ok);
                                    const resStatus = (response && response.status) || 0;
                                    const resBody = (response && response.body) || undefined;
                                    const resText = (response && response.text) || undefined;

                                    let transformed;
                                    let newEntities;

                                    if (
                                        includes(config.retryableStatusCodes, resStatus) &&
                                        attempts < config.backoff.maxAttempts
                                    ) {
                                        // TODO take into account Retry-After header if 503
                                        setTimeout(attemptRequest, backoff.duration());
                                        return;
                                    }

                                    if (err || !resOk) {
                                        dispatch(
                                            requestFailure(
                                                url,
                                                body,
                                                resStatus,
                                                resBody,
                                                meta,
                                                queryKey
                                            )
                                        );
                                    } else {
                                        const callbackState = getState();
                                        const entities = entitiesSelector(callbackState);
                                        transformed = fromJS(transform(resBody, resText));
                                        newEntities = updateEntities(update, entities, transformed);
                                        dispatch(requestSuccess(url, body, resStatus, newEntities, meta, queryKey));
                                    }

                                    const end = new Date();
                                    const duration = end - start;
                                    resolve({
                                        body: resBody,
                                        duration,
                                        status: resStatus,
                                        text: resText,
                                        transformed,
                                        entities: newEntities,
                                    });
                                });
                            };

                            attemptRequest();
                        });
                }

                break;
            }
            case actionTypes.MUTATE_ASYNC: {
                const {
                    url,
                    transform = identity,
                    update,
                    body,
                    optimisticUpdate,
                    options = {},
                } = action;
                invariant(!!url, 'Missing required `url` field in action handler');

                const state = getState();
                const entities = entitiesSelector(state);
                let optimisticEntities;
                if (optimisticUpdate) {
                    optimisticEntities = optimisticUpdateEntities(optimisticUpdate, entities);
                }

                const queryKey = reconcileQueryKey(action);

                returnValue = new Promise((resolve) => {
                    const start = new Date();
                    const { method = httpMethods.POST } = options;

                    const request = createRequest(url, method);

                    if (options.headers) {
                        request.set(options.headers);
                    }

                    if (options.credentials === 'include') {
                        request.withCredentials();
                    }
                    // Note: only the entities that are included in `optimisticUpdate` will be passed along in the
                    // `mutateStart` action as `optimisticEntities`
                    dispatch(mutateStart(url, body, request, optimisticEntities, queryKey));

                    request.send(body).end((err, response) => {
                        const resOk = !!(response && response.ok);
                        const resStatus = (response && response.status) || 0;
                        const resBody = (response && response.body) || undefined;
                        const resText = (response && response.text) || undefined;

                        let transformed;
                        let newEntities;

                        if (err || !resOk) {
                            dispatch(mutateFailure(url, body, resStatus, entities, queryKey));
                        } else {
                            transformed = fromJS(transform(resBody, resText));
                            newEntities = updateEntities(update, entities, transformed);
                            dispatch(mutateSuccess(url, body, resStatus, newEntities, queryKey));
                        }

                        const end = new Date();
                        const duration = end - start;
                        resolve({
                            body: resBody,
                            duration,
                            status: resStatus,
                            text: resText,
                            transformed,
                            entities: newEntities,
                        });
                    });
                });

                break;
            }
            case actionTypes.CANCEL_QUERY: {
                const { queryKey } = action;
                invariant(!!queryKey, 'Missing required `queryKey` field in action handler');

                const state = getState();
                const queries = queriesSelector(state);
                const pendingQueries = getPendingQueries(queries);

                if (pendingQueries.has(queryKey)) {
                    pendingQueries.getIn([queryKey, 'request', 'abort'])();
                    returnValue = next(action);
                } else {
                    console.warn('Trying to cancel a request that is not in flight: ', queryKey);
                    returnValue = null;
                }

                break;
            }
            case actionTypes.RESET: {
                const state = getState();
                const queries = queriesSelector(state);
                const pendingQueries = getPendingQueries(queries);

                pendingQueries.forEach((query) => query.getIn(['request', 'abort'])());
                returnValue = next(action);

                break;
            }
            default: {
                returnValue = next(action);
            }
        }

        return returnValue;
    };
};

export default queryMiddleware;
