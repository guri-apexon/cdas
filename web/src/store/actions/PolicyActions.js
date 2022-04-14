import { POLICY_LIST, UPDATE_POLICY_STATUS } from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export const getPolicyList = (filtered = false) => {
  return {
    type: POLICY_LIST,
    filtered,
  };
};
export const updateStatus = (data) => {
  return {
    type: UPDATE_POLICY_STATUS,
    ...data,
  };
};
