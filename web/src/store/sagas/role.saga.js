import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  ROLE_LIST_FAILURE,
  ROLE_LIST_SUCCESS,
  ROLE_FETCH,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export function* fetchRoles() {
  try {
    const roleData = yield call(axios.get, `${baseURL}/${ROLE_FETCH}`, {});

    yield put({
      type: ROLE_LIST_SUCCESS,
      roles: roleData.data.data,
    });
  } catch (e) {
    yield put({ type: ROLE_LIST_FAILURE, message: e.message });
  }
}
