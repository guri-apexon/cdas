import { ROLE_LIST_FETCH, UPDATE_ROLE_STATUS } from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export const fetchRoles = () => {
  return {
    type: ROLE_LIST_FETCH,
  };
};

export const updateStatus = (data) => {
  return {
    type: UPDATE_ROLE_STATUS,
    ...data,
  };
};
