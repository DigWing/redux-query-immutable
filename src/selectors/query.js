import { getQueryKey } from '../lib/query-key';

const TYPES = {
  SOME: 'some',
  EVERY: 'every',
};

const getQueryState = (queriesState, queryConfig, queryStateKey, defaultValue) => {
  if (queryConfig) {
    const queryKey = getQueryKey(queryConfig);

    return queriesState.getIn([queryKey, queryStateKey], defaultValue);
  }
};

const getManyQueriesState = (queriesState, queryConfig, queryStateKey, type) => {
  if (queryConfig && queryConfig.keys && Array.isArray(queryConfig.keys)) {
    if (type === TYPES.EVERY) {
      return queryConfig.keys.every(key => queriesState.getIn([key, queryStateKey]));
    }
    if (type === TYPES.SOME) {
      return queryConfig.keys.some(key => queriesState.getIn([key, queryStateKey]));
    }
  }
};

export const isAnyFinished = (queriesState, queryConfig) => {
  return getManyQueriesState(queriesState, queryConfig, 'isFinished', TYPES.SOME);
};

export const isAnyPending = (queriesState, queryConfig) => {
  return getManyQueriesState(queriesState, queryConfig, 'isPending', TYPES.SOME);
};

export const isEveryFinished = (queriesState, queryConfig) => {
  return getManyQueriesState(queriesState, queryConfig, 'isFinished', TYPES.EVERY);
};

export const isEveryPending = (queriesState, queryConfig) => {
  return getManyQueriesState(queriesState, queryConfig, 'isPending', TYPES.EVERY);
};

export const isFinished = (queriesState, queryConfig) => {
  return getQueryState(queriesState, queryConfig, 'isFinished', false);
};

export const isPending = (queriesState, queryConfig) => {
  return getQueryState(queriesState, queryConfig, 'isPending', false);
};

export const status = (queriesState, queryConfig) => {
  return getQueryState(queriesState, queryConfig, 'status');
};

export const headers = (queriesState, queryConfig) => {
  return getQueryState(queriesState, queryConfig, 'headers');
};

export const lastUpdated = (queriesState, queryConfig) => {
  return getQueryState(queriesState, queryConfig, 'lastUpdated');
};

export const queryCount = (queriesState, queryConfig) => {
  return getQueryState(queriesState, queryConfig, 'queryCount');
};
