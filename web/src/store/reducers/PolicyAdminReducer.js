import produce from "immer";
// import moment from "moment";

import {
  POLICY_LIST,
  POLICY_LIST_SUCCESS,
  POLICY_LIST_FAILURE,
} from "../../constants";

export const initialState = {
  policyList: [],
  uniqueProducts: [],
  loading: false,
};

const PolicyAdminReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case POLICY_LIST:
        newState.loading = true;
        break;

      case POLICY_LIST_SUCCESS:
        newState.loading = false;
        newState.policyList = action.policyList;
        newState.uniqueProducts = action.uniqueProducts;
        break;

      case POLICY_LIST_FAILURE:
        newState.loading = false;
        break;

      default:
        break;
    }
  });

export default PolicyAdminReducer;
