import { put, call } from "redux-saga/effects";
import axios from "axios";
import {
  baseURL,
  STUDYBOARD_DATA_FETCH,
  STUDYBOARD_FETCH_SUCCESS,
  STUDYBOARD_FETCH_FAILURE,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export function* fetchStudyboardData() {
  try {
    const studyboardData = yield call(
      axios.post,
      `${baseURL}/${STUDYBOARD_DATA_FETCH}`,
      {}
    );
    // console.log("study", studyboardData);
    yield put({
      type: STUDYBOARD_FETCH_SUCCESS,
      studyboardData: studyboardData.data.data,
      studyboardTotalCount: studyboardData.data.studyboardTotalCount,
    });
  } catch (e) {
    yield put({ type: STUDYBOARD_FETCH_FAILURE, message: e.message });
  }
}
