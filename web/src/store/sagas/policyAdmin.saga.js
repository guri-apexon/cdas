import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  POLICY_LIST_FETCH,
  POLICY_LIST_FAILURE,
  POLICY_LIST_SUCCESS,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export function* fetchPolicyListData() {
  try {
    const fetchSBData = yield call(
      axios.post,
      `${baseURL}/${POLICY_LIST_FETCH}`,
      {}
    );

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
