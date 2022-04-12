import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  POLICY_LIST_FETCH,
  UPDATE_POLICY,
  POLICY_LIST_FAILURE,
  POLICY_LIST_SUCCESS,
  UPDATE_POLICY_STATUS_SUCCESS,
  UPDATE_POLICY_STATUS_FAILURE,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export function* fetchPolicies(param) {
  try {
    let fetchSBData;
    if (param.filtered) {
      fetchSBData = yield call(axios.get, `${baseURL}/${POLICY_LIST_FETCH}`);
    } else {
      fetchSBData = yield call(
        axios.post,
        `${baseURL}/${POLICY_LIST_FETCH}`,
        {}
      );
    }

    // console.log("study", fetchSBData);
    yield put({
      type: POLICY_LIST_SUCCESS,
      policyList: fetchSBData.data.data.policyList,
      uniqueProducts: fetchSBData.data.data.uniqueProducts,
    });
  } catch (e) {
    yield put({ type: POLICY_LIST_FAILURE, message: e.message });
  }
}
export function* updatePolicyStatus(params) {
  try {
    let fetchData;
    // eslint-disable-next-line prefer-const
    fetchData = yield call(axios.post, `${baseURL}/${UPDATE_POLICY}`, params);
    yield put({
      type: UPDATE_POLICY_STATUS_SUCCESS,
      response: fetchData.data.data.updatedPolicy,
    });
  } catch (e) {
    yield put({ type: UPDATE_POLICY_STATUS_FAILURE, message: e.message });
  }
}
