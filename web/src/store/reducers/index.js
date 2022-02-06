import { combineReducers } from "redux";
import StudyBoardReaducer from "./StudyBoardReducer";
import PolicyAdminReducer from "./PolicyAdminReducer";
import RolesReducer from "./RolesReducer";

// eslint-disable-next-line import/prefer-default-export
export const appReducer = combineReducers({
  // launchPad: launchPadReducer,
  studyBoard: StudyBoardReaducer,
  policyAdmin: PolicyAdminReducer,
  Roles: RolesReducer,
});
