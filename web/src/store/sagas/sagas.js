import { takeEvery, takeLatest } from "redux-saga/effects";
// import axios from "axios";
import {
  STUDYBOARD_DATA,
  STUDY_NOTONBOARDED_STATUS,
  POLICY_LIST,
  UPDATE_POLICY_STATUS,
  GET_VENDOR_DETAILS,
  VENDOR_LIST,
  VENS_LIST,
  ROLE_LIST_FETCH,
  UPDATE_ROLE_STATUS,
  GET_USER_PERMISSIONS,
} from "../../constants";

import {
  fetchStudyboardData,
  fetchNotOnStudyboardStatus,
} from "./studyboard.saga";
import { fetchRoles, updateRoleStatus } from "./role.saga";
import { fetchPolicies, updatePolicyStatus } from "./policy.saga";
import { fetchPermissions } from "./user.saga";
import {
  fetchVendorList,
  fetchVendorDetails,
  fetchENSList,
} from "./vendor.saga";

function* cdasCoreSaga() {
  yield takeEvery(STUDYBOARD_DATA, fetchStudyboardData);
  yield takeLatest(STUDY_NOTONBOARDED_STATUS, fetchNotOnStudyboardStatus);
  yield takeEvery(POLICY_LIST, fetchPolicies);
  yield takeEvery(UPDATE_POLICY_STATUS, updatePolicyStatus);
  yield takeEvery(VENDOR_LIST, fetchVendorList);
  yield takeEvery(VENS_LIST, fetchENSList);
  yield takeEvery(GET_VENDOR_DETAILS, fetchVendorDetails);
  yield takeEvery(ROLE_LIST_FETCH, fetchRoles);
  yield takeEvery(UPDATE_ROLE_STATUS, updateRoleStatus);
  yield takeEvery(GET_USER_PERMISSIONS, fetchPermissions);
}

export default cdasCoreSaga;
