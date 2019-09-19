import { fromJS, Map } from 'immutable';

import {
  MUTATE_FAILURE,
  MUTATE_START,
  MUTATE_SUCCESS,
  REQUEST_SUCCESS,
  RESET,
  UPDATE_ENTITIES,
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

const entities = (state = initialState, action) => {
  if (action.type === RESET) {
    return 'entities' in action ? action.entities : initialState;
  } else if (action.type === MUTATE_START && action.optimisticEntities) {
    return state.merge(action.optimisticEntities);
  } else if (action.type === MUTATE_FAILURE && action.rolledBackEntities) {
    return state.merge(action.rolledBackEntities);
  } else if (action.type === REQUEST_SUCCESS || action.type === MUTATE_SUCCESS) {
    return state.merge(action.entities);
  } else if (action.type === UPDATE_ENTITIES) {
    return state.merge(action.update);
  } else {
    return state;
  }
};

export default entities;
