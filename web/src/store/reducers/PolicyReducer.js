import produce from "immer";
// import moment from "moment";

import {
  POLICY_LIST,
  POLICY_LIST_SUCCESS,
  POLICY_LIST_FAILURE,
  UPDATE_POLICY_STATUS,
  UPDATE_POLICY_STATUS_SUCCESS,
  UPDATE_POLICY_STATUS_FAILURE,
} from "../../constants";

export const initialState = {
  policyList: [],
  uniqueProducts: [],
  loading: false,
};

const PolicyReducer = (state = initialState, action) =>
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
      case UPDATE_POLICY_STATUS:
        newState.loading = true;
        break;

      case UPDATE_POLICY_STATUS_SUCCESS:
        newState.loading = false;
        newState.policyList = newState.policyList.map((policy) =>
          policy.policyId === action.response.plcy_id
            ? { ...policy, policyStatus: action.response.plcy_stat }
            : policy
        );
        break;

      case UPDATE_POLICY_STATUS_FAILURE:
        newState.loading = true;
        break;
      default:
        break;
    }
  });

export default PolicyReducer;
