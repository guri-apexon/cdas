import { POLICY_LIST } from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export const getPolicyList = (filtered = false) => {
  return {
    type: POLICY_LIST,
    filtered,
  };
};
