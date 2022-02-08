import { takeEvery, takeLatest } from "redux-saga/effects";
// import axios from "axios";
import {
  STUDYBOARD_DATA,
  STUDY_NOTONBOARDED_STATUS,
  POLICY_LIST,
  VENDOR_LIST,
  ROLE_LIST_FETCH,
} from "../../constants";
import {
  fetchStudyboardData,
  fetchNotOnStudyboardStatus,
} from "./studyboard.saga";

import { fetchRoles } from "./role.saga";
import { fetchPolicies } from "./policy.saga";
import { fetchVendorList } from "./vendor.saga";

function* cdasCoreSaga() {
  yield takeEvery(STUDYBOARD_DATA, fetchStudyboardData);
  yield takeLatest(STUDY_NOTONBOARDED_STATUS, fetchNotOnStudyboardStatus);
  yield takeEvery(POLICY_LIST, fetchPolicies);
  yield takeEvery(VENDOR_LIST, fetchVendorList);
  yield takeEvery(ROLE_LIST_FETCH, fetchRoles);
}

export default cdasCoreSaga;
