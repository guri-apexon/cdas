import produce from "immer";
// import moment from "moment";

import {
  VENDOR_LIST,
  VENDOR_LIST_SUCCESS,
  VENDOR_LIST_FAILURE,
} from "../../constants";

export const initialState = {
  vendorList: [],
  loading: false,
};

const VendorAdminReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case VENDOR_LIST:
        newState.loading = true;
        break;

      case VENDOR_LIST_SUCCESS:
        newState.loading = false;
        newState.vendorList = action.vendorList;
        break;

      case VENDOR_LIST_FAILURE:
        newState.loading = false;
        break;

      default:
        break;
    }
  });

export default VendorAdminReducer;
