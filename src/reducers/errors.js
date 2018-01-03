import { Map, fromJS } from 'immutable';

import * as actionTypes from '../constants/action-types';

const initialState = new Map();

const queries = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.RESET: {
      return new Map();
    }
    case actionTypes.MUTATE_START:
    case actionTypes.REQUEST_START: {
      const { queryKey } = action;

      return state.deleteIn([queryKey]);
    }
    case actionTypes.MUTATE_FAILURE:
    case actionTypes.REQUEST_FAILURE: {
      const { queryKey } = action;

      return state.mergeIn(
        [queryKey],
        fromJS({
          responseBody: action.responseBody,
          responseText: action.responseText,
          responseHeaders: action.responseHeaders,
        }),
      );
    }
    default: {
      return state;
    }
  }
};

export default queries;
