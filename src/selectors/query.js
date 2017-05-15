import { reconcileQueryKey } from '../lib/query-key';

const getQueryState = (urlOrConfig, body, queriesState, queryStateKey) => {
    let queryKey;

    if (typeof urlOrConfig === 'string') {
        queryKey = reconcileQueryKey({ url: urlOrConfig, body });
    } else {
        queryKey = reconcileQueryKey(urlOrConfig);
    }

    return queriesState.getIn([queryKey, queryStateKey]);
};

export const isFinished = (urlOrConfig, body) => queriesState => {
    return getQueryState(urlOrConfig, body, queriesState, 'isFinished');
};

export const isPending = (urlOrConfig, body) => queriesState => {
    return getQueryState(urlOrConfig, body, queriesState, 'isPending');
};

export const status = (urlOrConfig, body) => queriesState => {
    return getQueryState(urlOrConfig, body, queriesState, 'status');
};

export const lastUpdated = (urlOrConfig, body) => queriesState => {
    return getQueryState(urlOrConfig, body, queriesState, 'lastUpdated');
};

export const queryCount = (urlOrConfig, body) => queriesState => {
    return getQueryState(urlOrConfig, body, queriesState, 'queryCount');
};
