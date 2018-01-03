import { getQueryKey } from '../lib/query-key';

const getQueryState = (errorsState, queryConfig, queryStateKey) => {
  if (queryConfig) {
    const queryKey = getQueryKey(queryConfig);

    return errorsState.getIn([queryKey, queryStateKey]);
  }
};

export const responseBody = (errorsState, queryConfig) => {
  return getQueryState(errorsState, queryConfig, 'responseBody');
};

export const responseText = (errorsState, queryConfig) => {
  return getQueryState(errorsState, queryConfig, 'responseText');
};

export const responseHeaders = (errorsState, queryConfig) => {
  return getQueryState(errorsState, queryConfig, 'responseHeaders');
};
