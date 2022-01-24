import { takeEvery, takeLatest } from "redux-saga/effects";
// import axios from "axios";
import {
  STUDYBOARD_DATA,
  STUDY_NOTONBOARDED_STATUS,
  POLICY_LIST,
} from "../../constants";
import {
  fetchStudyboardData,
  fetchNotOnStudyboardStatus,
} from "./studyboard.saga";

import { fetchPolicyListData } from "./policyAdmin.saga";

function* cdasCoreSaga() {
  yield takeEvery(STUDYBOARD_DATA, fetchStudyboardData);
  yield takeLatest(STUDY_NOTONBOARDED_STATUS, fetchNotOnStudyboardStatus);
  yield takeEvery(POLICY_LIST, fetchPolicyListData);
}

export default cdasCoreSaga;
