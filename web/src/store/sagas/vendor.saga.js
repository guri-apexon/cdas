import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  VENDOR_BASE,
  VENDOR_LIST_FAILURE,
  VENDOR_LIST_SUCCESS,
  VENDOR_DETAILS_FAILURE,
  VENDOR_DETAILS_SUCCESS,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export function* fetchVendorList() {
  try {
    const fetchData = yield call(
      axios.post,
      `${baseURL}/${VENDOR_BASE}/list`,
      {}
    );
    yield put({
      type: VENDOR_LIST_SUCCESS,
      vendorList: fetchData.data.data,
    });
  } catch (e) {
    yield put({ type: VENDOR_LIST_FAILURE, message: e.message });
  }
}

export function* fetchVendorDetails(action) {
  try {
    const fetchData = yield call(
      axios.get,
      `${baseURL}/${VENDOR_BASE}/details/${action.vId}`
    );
    // console.log("data", fetchData);
    yield put({
      type: VENDOR_DETAILS_SUCCESS,
      vendor: fetchData.data.data.vendor,
      contacts: fetchData.data.data.contacts,
    });
  } catch (e) {
    yield put({ type: VENDOR_DETAILS_FAILURE, message: e.message });
  }
}
