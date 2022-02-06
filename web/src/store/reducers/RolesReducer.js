import produce from "immer";

import {
  ROLE_LIST_FETCH,
  ROLE_LIST_FAILURE,
  ROLE_LIST_SUCCESS,
} from "../../constants";

export const initialState = {
  roles: [],
  loading: false,
};

const roleReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case ROLE_LIST_FETCH:
        newState.loading = true;
        break;

      case ROLE_LIST_SUCCESS:
        newState.loading = false;
        newState.roles = action.roles;
        break;

      case ROLE_LIST_FAILURE:
        newState.loading = true;
        break;

      default:
        break;
    }
  });

export default roleReducer;
