import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  VENDOR_BASE,
  VENDOR_LIST_FAILURE,
  VENDOR_LIST_SUCCESS,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export function* fetchVendorListData() {
  try {
    const fetchData = yield call(
      axios.post,
      `${baseURL}/${VENDOR_BASE}/list`,
      {}
    );

    console.log("study", fetchData);
    yield put({
      type: VENDOR_LIST_SUCCESS,
      vendorList: fetchData.data.data,
    });
  } catch (e) {
    yield put({ type: VENDOR_LIST_FAILURE, message: e.message });
  }
}
