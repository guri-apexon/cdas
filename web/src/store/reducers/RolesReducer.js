import produce from "immer";

import {
  ROLE_LIST_FETCH,
  ROLE_LIST_FAILURE,
  ROLE_LIST_SUCCESS,
  UPDATE_ROLE_STATUS,
  UPDATE_ROLE_STATUS_SUCCESS,
  UPDATE_ROLE_STATUS_FAILURE,
  // eslint-disable-next-line import/named
} from "../../constants";

export const initialState = {
  roles: [],
  uniqueProducts: [],
  loading: false,
  errmsg: "",
};

const roleReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case ROLE_LIST_FETCH:
        newState.loading = true;
        newState.errmsg = "";
        break;

      case ROLE_LIST_SUCCESS:
        newState.loading = false;
        newState.roles = action.roles.roles;
        newState.uniqueProducts = action.roles.uniqueProducts;
        break;

      case UPDATE_ROLE_STATUS:
        newState.loading = true;
        break;

      case UPDATE_ROLE_STATUS_SUCCESS:
        newState.loading = false;
        break;

      case UPDATE_ROLE_STATUS_FAILURE:
        newState.loading = false;
        newState.errmsg = action.message;
        break;

      case ROLE_LIST_FAILURE:
        newState.loading = true;
        break;

      default:
        break;
    }
  });

export default roleReducer;
