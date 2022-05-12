/* eslint-disable import/prefer-default-export */
import {
  VENDOR_LIST,
  GET_VENDOR_DETAILS,
  CREATE_VENDOR,
  VENS_LIST,
  UPDATE_VENDOR_STATUS,
} from "../../constants";

export const getVendorList = () => {
  return {
    type: VENDOR_LIST,
  };
};

export const selectVendor = (vId) => {
  return {
    type: GET_VENDOR_DETAILS,
    vId,
  };
};

export const createVendor = () => {
  return {
    type: CREATE_VENDOR,
  };
};

export const getENSList = () => {
  return {
    type: VENS_LIST,
  };
};

export const updateVendorStatus = (payload) => {
  return {
    type: UPDATE_VENDOR_STATUS,
    payload,
  };
};
