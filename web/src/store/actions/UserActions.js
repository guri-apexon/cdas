/* eslint-disable import/prefer-default-export */
import { CREAT_USER } from "../../constants";

export const createUser = () => {
  return {
    type: CREAT_USER,
  };
};
