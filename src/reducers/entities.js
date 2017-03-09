import * as actionTypes from '../constants/action-types';
import { fromJS } from 'immutable';

const initialState = fromJS({});

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
    if (action.type === actionTypes.RESET) {
        return 'entities' in action ? action.entities : initialState;
    } else if (action.type === actionTypes.MUTATE_START && action.optimisticEntities) {
        return state.merge(action.optimisticEntities);
    } else if (action.type === actionTypes.MUTATE_FAILURE && action.originalEntities) {
        return state.merge(action.originalEntities);
    } else if (action.type === actionTypes.REQUEST_SUCCESS || action.type === actionTypes.MUTATE_SUCCESS) {
        return state.merge(action.entities);
    } else if (action.type === actionTypes.REMOVE_ENTITIES) {
        return action.paths.reduce((accum, path) => {
            return withoutPath(accum, path);
        }, state);
    } else if (action.type === actionTypes.REMOVE_ENTITY) {
        return withoutPath(state, action.path);
    } else {
        return state;
    }
};

export default entities;
