import { takeEvery } from "redux-saga/effects";
// import axios from "axios";
import { STUDYBOARD_DATA } from "../../constants";
import { fetchStudyboardData } from "./studyboard.saga";

function* cdasCoreSaga() {
  yield takeEvery(STUDYBOARD_DATA, fetchStudyboardData);
}

export default cdasCoreSaga;
