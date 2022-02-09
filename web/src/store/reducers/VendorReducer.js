import produce from "immer";
// import moment from "moment";

import {
  VENDOR_LIST,
  VENDOR_LIST_SUCCESS,
  VENDOR_LIST_FAILURE,
  GET_VENDOR_DETAILS,
  VENDOR_DETAILS_FAILURE,
  VENDOR_DETAILS_SUCCESS,
  CREATE_VENDOR,
} from "../../constants";

export const initialState = {
  vendorList: [],
  loading: false,
  selectedVendor: {},
  selectedContacts: [],
  isEditPage: false,
  isCreatePage: true,
};

const VendorReducer = (state = initialState, action) =>
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

      case GET_VENDOR_DETAILS:
        newState.loading = true;
        break;

      case VENDOR_DETAILS_SUCCESS:
        newState.loading = false;
        newState.isEditPage = true;
        newState.isCreatePage = false;
        newState.selectedContacts = action.contacts;
        newState.selectedVendor = action.vendor;
        break;

      case VENDOR_DETAILS_FAILURE:
        newState.loading = false;
        newState.isEditPage = false;
        break;

      case CREATE_VENDOR:
        newState.isEditPage = false;
        newState.isCreatePage = true;
        newState.selectedContacts = [];
        newState.selectedVendor = {};
        break;

      default:
        break;
    }
  });

export default VendorReducer;
