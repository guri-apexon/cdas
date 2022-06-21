import produce from "immer";
// import moment from "moment";

import {
  CREAT_USER,
  UPDATE_USER_STATUS,
  USER_PERMISSIONS_SUCCESS,
} from "../../constants";

export const initialState = {
  userList: [],
  loading: false,
  selectedUser: {},
  isEditPage: false,
  isCreatePage: true,
};

const UserReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      // case UPDATE_USER_STATUS:
      //   // console.log("action", action);
      //   // eslint-disable-next-line no-case-declarations
      //   const newList = state.userList.map((u) => {
      //     if (u.vId === action?.payload?.uId) {
      //       const newObj = { ...u };
      //       newObj.uStatus = action?.payload?.newStatus;
      //       return newObj;
      //     }
      //     return u;
      //   });
      //   newState.userList = newList;
      //   break;

      case CREAT_USER:
        newState.isEditPage = false;
        newState.isCreatePage = true;
        newState.selectedUser = {};
        break;
      case USER_PERMISSIONS_SUCCESS:
        newState.permissions = action.response;
        break;

      default:
        break;
    }
  });

export default UserReducer;
