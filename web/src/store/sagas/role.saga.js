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
  // eslint-disable-next-line import/named
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export function* fetchRoles() {
  try {
    const { data } = yield call(axios.get, `${baseURL}/${ROLE_FETCH}`, {});
    yield put({
      type: ROLE_LIST_SUCCESS,
      roles: data.data,
    });
  } catch (e) {
    yield put({ type: ROLE_LIST_FAILURE, message: e.message });
  }
}

export function* updateRoleStatus(params) {
  try {
    let fetchData;
    // eslint-disable-next-line prefer-const
    fetchData = yield call(axios.post, `${baseURL}/${UPDATE_ROLE}`, params);

    yield put({
      type: UPDATE_ROLE_STATUS_SUCCESS,
      response: fetchData.data,
    });
  } catch (e) {
    yield put({ type: UPDATE_ROLE_STATUS_FAILURE, message: e.message });
  }
}
