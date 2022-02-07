/* eslint-disable import/prefer-default-export */
import { VENDOR_LIST } from "../../constants";

export const getVendorList = () => {
  return {
    type: VENDOR_LIST,
  };
};
