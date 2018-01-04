import * as actionTypes from '../constants/action-types';
import { Map, fromJS } from 'immutable';

const initialState = Map();

const queries = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.RESET: {
      return initialState;
    }
    case actionTypes.MUTATE_START:
    case actionTypes.REQUEST_START: {
      const newMap = {
        [action.queryKey]: {
          url: action.url,
          isFinished: false,
          isPending: true,
          networkHandler: action.networkHandler,
          isMutation: action.type === actionTypes.MUTATE_START,
          queryCount: state.get(action.queryKey)
            ? state.getIn([action.queryKey, 'queryCount']) + 1
            : 1,
        },
      };

      return state.merge(fromJS(newMap));
    }
    case actionTypes.REQUEST_SUCCESS:
    case actionTypes.MUTATE_FAILURE:
    case actionTypes.MUTATE_SUCCESS:
    case actionTypes.REQUEST_FAILURE: {
      const newQueryKeyState = {
        isFinished: true,
        isPending: false,
        lastUpdated: action.time,
        status: action.status,
        headers: action.responseHeaders,
      };

      return state.mergeIn([action.queryKey], fromJS(newQueryKeyState));
    }
    case actionTypes.CANCEL_QUERY: {
      if (state.getIn([action.queryKey, 'isPending'])) {
        // Make sure request is actually pending

        const newQueryKeyState = {
          isFinished: true,
          isPending: false,
          status: 0,
        };

        return state.mergeIn([action.queryKey], fromJS(newQueryKeyState));
      }

      return state;
    }
    default: {
      return state;
    }
  }
};

export default queries;
