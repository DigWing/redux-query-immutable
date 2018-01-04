import { getQueryKey } from '../lib/query-key';

const getQueryState = (queriesState, queryConfig, queryStateKey) => {
  if (queryConfig) {
    const queryKey = getQueryKey(queryConfig);

    return queriesState.getIn([queryKey, queryStateKey]);
  }
};

export const isFinished = (queriesState, queryConfig) => {
  return getQueryState(queriesState, queryConfig, 'isFinished');
};

export const isPending = (queriesState, queryConfig) => {
  return getQueryState(queriesState, queryConfig, 'isPending');
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
