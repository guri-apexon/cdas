/* eslint-disable import/prefer-default-export */
import { combineReducers } from "redux";
import StudyBoardReaducer from "./StudyBoardReducer";
import PolicyReducer from "./PolicyReducer";
import VendorReducer from "./VendorReducer";
import RolesReducer from "./RolesReducer";
import AlertReducer from "./AlertReducer";

export const appReducer = combineReducers({
  studyBoard: StudyBoardReaducer,
  policy: PolicyReducer,
  vendor: VendorReducer,
  Roles: RolesReducer,
  Alert: AlertReducer,
});
