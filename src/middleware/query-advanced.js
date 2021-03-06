import Backoff from 'backo';
import invariant from 'invariant';
import { fromJS, Map, Set } from 'immutable';
import identity from 'lodash.identity';
import includes from 'lodash.includes';
import isfunction from 'lodash.isfunction';

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
import { getQueryKey } from '../lib/query-key';
import {
  updateEntities,
  optimisticUpdateEntities,
  rollbackEntities,
  updateResults,
} from '../lib/update';

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

const getPendingQueries = queries => {
  return queries.filter(query => query.get('isPending'));
};

const keyIn = keys => {
  const keySet = Set(keys);
  return (v, k) => {
    return keySet.has(k);
  };
};

const resOk = status => Math.floor(status / 100) === 2;

const queryMiddlewareAdvanced = networkInterface => (
  queriesSelector,
  entitiesSelector,
  resultsSelector,
  config = defaultConfig,
) => {
  return ({ dispatch, getState }) => next => action => {
    let returnValue;

    switch (action.type) {
      case actionTypes.REQUEST_ASYNC: {
        const {
          url,
          body,
          force,
          retry,
          transform = identity,
          transformResult = identity,
          update,
          updateResult,
          options = {},
          meta,
        } = action;

        invariant(!!url, 'Missing required `url` field in action handler');
        invariant(!!update, 'Missing required `update` field in action handler');

        const queryKey = getQueryKey(action);

        const state = getState();
        const queries = queriesSelector(state);

        const queriesState = queries.get(queryKey, new Map());
        const isPending = queriesState.get('isPending');
        const status = queriesState.get('status');
        const hasSucceeded = status >= 200 && status < 300;

        if (force || queriesState.isEmpty() || (retry && !isPending && !hasSucceeded)) {
          returnValue = new Promise(resolve => {
            const start = new Date();
            const { method = httpMethods.GET } = options;
            let attempts = 0;
            const backoff = new Backoff({
              min: config.backoff.minDuration,
              max: config.backoff.maxDuration,
            });

            const attemptRequest = () => {
              const networkHandler = networkInterface(url, method, {
                body,
                headers: options.headers,
                credentials: options.credentials,
              });

              dispatch(
                requestStart({
                  body,
                  meta,
                  networkHandler,
                  queryKey,
                  url,
                }),
              );

              attempts += 1;

              networkHandler.execute((err, status, responseBody, responseText, responseHeaders) => {
                if (
                  includes(config.retryableStatusCodes, status) &&
                  attempts < config.backoff.maxAttempts
                ) {
                  // TODO take into account Retry-After header if 503
                  setTimeout(attemptRequest, backoff.duration());
                  return;
                }

                const end = new Date();
                const duration = end - start;
                let transformed;
                let newEntities;
                let transformedResult;
                let newResults;

                if (action.unstable_preDispatchCallback) {
                  action.unstable_preDispatchCallback();
                }

                if (err || !resOk(status)) {
                  dispatch(
                    requestFailure({
                      body,
                      duration,
                      meta,
                      queryKey,
                      responseBody,
                      responseHeaders,
                      status,
                      responseText,
                      url,
                    }),
                  );

                  resolve({
                    body: responseBody,
                    duration,
                    status: status,
                    text: responseText,
                    headers: responseHeaders,
                  });
                } else {
                  const callbackState = getState();
                  const entities = entitiesSelector(callbackState);
                  const results = resultsSelector(callbackState);
                  transformed = fromJS(transform(responseBody, responseText));
                  newEntities = updateEntities(update, entities, transformed);
                  transformedResult = fromJS(transformResult(responseBody, responseText));
                  newResults = updateResults(updateResult, results, transformedResult);

                  dispatch(
                    requestSuccess({
                      body,
                      duration,
                      meta,
                      entities: newEntities,
                      results: newResults,
                      queryKey,
                      responseBody,
                      responseHeaders,
                      status,
                      responseText,
                      url,
                    }),
                  );

                  resolve({
                    body: responseBody,
                    duration,
                    status,
                    text: responseText,
                    transformed,
                    entities: newEntities,
                    transformedResult,
                    results: newResults,
                    headers: responseHeaders,
                  });
                }
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
          transformResult = identity,
          update,
          updateResult,
          rollback,
          body,
          optimisticUpdate,
          options = {},
          meta,
        } = action;

        invariant(!!url, 'Missing required `url` field in action handler');

        const initialState = getState();
        const initialEntities = entitiesSelector(initialState);
        let optimisticEntities;

        if (optimisticUpdate) {
          optimisticEntities = optimisticUpdateEntities(optimisticUpdate, initialEntities);
        }

        const queryKey = getQueryKey(action);

        returnValue = new Promise(resolve => {
          const start = new Date();
          const { method = httpMethods.POST } = options;

          const networkHandler = networkInterface(url, method, {
            body,
            headers: options.headers,
            credentials: options.credentials,
            multipart: options.multipart,
          });

          // Note: only the entities that are included in `optimisticUpdate` will be passed along in the
          // `mutateStart` action as `optimisticEntities`
          dispatch(
            mutateStart({
              body,
              meta,
              networkHandler,
              optimisticEntities,
              queryKey,
              url,
            }),
          );

          networkHandler.execute((err, status, responseBody, responseText, responseHeaders) => {
            const end = new Date();
            const duration = end - start;
            const state = getState();
            const entities = entitiesSelector(state);
            const results = resultsSelector(state);

            let transformed;
            let newEntities;
            let transformedResult;
            let newResults;

            if (err || !resOk(status)) {
              let rolledBackEntities;

              if (optimisticUpdate) {
                rolledBackEntities = rollbackEntities(
                  rollback,
                  initialEntities.filter(keyIn(Object.keys(optimisticEntities.toObject()))),
                  entities.filter(keyIn(Object.keys(optimisticEntities.toObject()))),
                );
              }

              dispatch(
                mutateFailure({
                  body,
                  duration,
                  meta,
                  queryKey,
                  responseBody,
                  responseHeaders,
                  status,
                  responseText,
                  rolledBackEntities,
                  url,
                }),
              );

              resolve({
                body: responseBody,
                duration,
                status,
                text: responseText,
                headers: responseHeaders,
              });
            } else {
              transformed = fromJS(transform(responseBody, responseText));
              newEntities = updateEntities(update, entities, transformed);
              transformedResult = fromJS(transformResult(responseBody, responseText));
              newResults = updateResults(updateResult, results, transformedResult);

              dispatch(
                mutateSuccess({
                  url,
                  body,
                  duration,
                  status,
                  entities: newEntities,
                  results: newResults,
                  queryKey,
                  responseBody,
                  responseText,
                  responseHeaders,
                  meta,
                }),
              );

              resolve({
                body: responseBody,
                duration,
                status,
                text: responseText,
                transformed,
                entities: newEntities,
                transformedResult,
                results: newResults,
                headers: responseHeaders,
              });
            }
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
          pendingQueries.getIn([queryKey, 'networkHandler', 'abort'])();
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

        pendingQueries.forEach(query => query.getIn(['networkHandler', 'abort'])());
        returnValue = next(action);

        break;
      }
      case actionTypes.REQUEST_SUCCESS: {
        const { successCallback } = action;

        if (successCallback && isfunction(successCallback)) {
          successCallback(action.responseBody);
        }

        returnValue = next(action);

        break;
      }
      case actionTypes.REQUEST_FAILURE: {
        const { errorCallback } = action;

        if (errorCallback && isfunction(errorCallback)) {
          errorCallback(action.responseBody);
        }

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

export default queryMiddlewareAdvanced;
