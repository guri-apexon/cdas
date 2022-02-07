/* eslint-disable import/prefer-default-export */
import { combineReducers } from "redux";
import StudyBoardReaducer from "./StudyBoardReducer";
import PolicyAdminReducer from "./PolicyAdminReducer";
import VendorAdminReducer from "./VendorAdminReducer";
import RolesReducer from "./RolesReducer";

export const appReducer = combineReducers({
  studyBoard: StudyBoardReaducer,
  policyAdmin: PolicyAdminReducer,
  vendorAdmin: VendorAdminReducer,
  Roles: RolesReducer,
});
