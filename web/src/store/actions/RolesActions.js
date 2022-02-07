import { ROLE_LIST_FETCH } from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export const fetchRoles = () => {
  return {
    type: ROLE_LIST_FETCH,
  };
};
