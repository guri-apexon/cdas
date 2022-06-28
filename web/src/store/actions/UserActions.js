/* eslint-disable import/prefer-default-export */
import { CREAT_USER, GET_USER_PERMISSIONS } from "../../constants";

export const createUser = () => {
  return {
    type: CREAT_USER,
  };
};
export const getPermissions = () => {
  return {
    type: GET_USER_PERMISSIONS,
  };
};
