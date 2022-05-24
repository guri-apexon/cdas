import produce from "immer";
// import moment from "moment";

import {
  VENDOR_LIST,
  VENDOR_LIST_SUCCESS,
  VENDOR_LIST_FAILURE,
  VENS_LIST,
  VENS_LIST_FAILURE,
  VENS_LIST_SUCCESS,
  GET_VENDOR_DETAILS,
  VENDOR_DETAILS_FAILURE,
  VENDOR_DETAILS_SUCCESS,
  CREATE_VENDOR,
  UPDATE_VENDOR_STATUS,
} from "../../constants";

export const initialState = {
  vendorList: [],
  loading: false,
  selectedVendor: {},
  selectedContacts: [],
  isEditPage: false,
  isCreatePage: true,
  ensList: [],
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
        newState.isEditPage = false;
        newState.isCreatePage = true;
        newState.selectedContacts = [];
        newState.selectedVendor = {};
        break;

      case UPDATE_VENDOR_STATUS:
        // console.log("action", action);
        // eslint-disable-next-line no-case-declarations
        const newList = state.vendorList.map((v) => {
          if (v.vId === action?.payload?.vId) {
            const newObj = { ...v };
            newObj.vStatus = action?.payload?.newStatus;
            return newObj;
          }
          return v;
        });
        newState.vendorList = newList;
        break;

      case VENS_LIST:
        newState.loading = true;
        break;

      case VENS_LIST_FAILURE:
        newState.loading = false;
        break;

      case VENS_LIST_SUCCESS:
        newState.loading = false;
        newState.ensList = action.ensList;
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
        newState.isCreatePage = true;
        newState.selectedContacts = [];
        newState.selectedVendor = {};
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
