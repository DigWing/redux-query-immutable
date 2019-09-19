import { fromJS, Map } from 'immutable';

import {
  MUTATE_FAILURE,
  MUTATE_START,
  MUTATE_SUCCESS,
  REQUEST_SUCCESS,
  RESET,
  UPDATE_RESULTS,
} from '../constants/action-types';

const initialState = new Map();

const withoutPath = (state, path) => {
  const [key, ...restPath] = path;

  if (restPath.length) {
    const newMap = fromJS({ [key]: withoutPath(state.get(key), restPath) });
    return state.merge(newMap);
  } else {
    return state.delete(key);
  }
};

const results = (state = initialState, action) => {
  if (action.type === RESET) {
    return 'results' in action ? action.results : initialState;
  } else if (action.type === MUTATE_START && action.optimisticResults) {
    return state.merge(action.optimisticResults);
  } else if (action.type === MUTATE_FAILURE && action.rolledBackResults) {
    return state.merge(action.rolledBackResults);
  } else if (action.type === REQUEST_SUCCESS || action.type === MUTATE_SUCCESS) {
    return state.merge(action.results);
  } else if (action.type === UPDATE_RESULTS) {
    return state.merge(action.update);
  } else {
    return state;
  }
};

export default results;
