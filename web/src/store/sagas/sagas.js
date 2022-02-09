import { takeEvery, takeLatest } from "redux-saga/effects";
// import axios from "axios";
import {
  STUDYBOARD_DATA,
  STUDY_NOTONBOARDED_STATUS,
  POLICY_LIST,
  ROLE_LIST_FETCH,
  UPDATE_ROLE_STATUS,
} from "../../constants";
import {
  fetchStudyboardData,
  fetchNotOnStudyboardStatus,
} from "./studyboard.saga";

import { fetchRoles, updateRoleStatus } from "./role.saga";

import { fetchPolicyListData } from "./policyAdmin.saga";

function* cdasCoreSaga() {
  yield takeEvery(STUDYBOARD_DATA, fetchStudyboardData);
  yield takeLatest(STUDY_NOTONBOARDED_STATUS, fetchNotOnStudyboardStatus);
  yield takeEvery(POLICY_LIST, fetchPolicyListData);
  yield takeEvery(ROLE_LIST_FETCH, fetchRoles);
  yield takeEvery(UPDATE_ROLE_STATUS, updateRoleStatus);
}

export default cdasCoreSaga;
