/* eslint-disable import/prefer-default-export */
import { VENDOR_LIST, GET_VENDOR_DETAILS } from "../../constants";

export const getVendorList = () => {
  return {
    type: VENDOR_LIST,
  };
};

export const selectVendor = () => {
  return {
    type: GET_VENDOR_DETAILS,
  };
};
