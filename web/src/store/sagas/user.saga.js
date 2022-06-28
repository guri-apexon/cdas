import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  ROLE_LIST_FAILURE,
  ROLE_LIST_SUCCESS,
  ROLE_FETCH,
  UPDATE_ROLE,
  UPDATE_ROLE_STATUS_SUCCESS,
  UPDATE_ROLE_STATUS_FAILURE,
  FETCH_PERMISSIONS,
  USER_PERMISSIONS_SUCCESS,
  USER_PERMISSIONS_FAILURE,
  // eslint-disable-next-line import/named
} from "../../constants";
import { getUserId } from "../../utils";

// eslint-disable-next-line import/prefer-default-export
export function* fetchPermissions() {
  try {
    const userId = getUserId();
    const fetchData = yield call(
      axios.post,
      `${baseURL}/${FETCH_PERMISSIONS}`,
      {
        userId,
        productName: "Admin",
      }
    );

    yield put({
      type: USER_PERMISSIONS_SUCCESS,
      response: fetchData.data?.data || fetchData.data,
    });
  } catch (e) {
    yield put({ type: USER_PERMISSIONS_FAILURE, message: e.message });
  }
}
