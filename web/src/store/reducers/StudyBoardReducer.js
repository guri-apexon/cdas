import produce from "immer";
// import moment from "moment";

import { STUDYBOARD_FETCH_SUCCESS, STUDYBOARD_DATA } from "../../constants";

export const initialState = {
  studyboardData: [],
  loading: false,
  exportStudy: null,
};

const StudyBoardReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case STUDYBOARD_DATA:
        newState.loading = true;
        break;

      case STUDYBOARD_FETCH_SUCCESS:
        newState.loading = false;
        newState.studyboardData = action.studyboardData;
        newState.studyboardTotalCount = action.studyboardTotalCount;
        newState.studyboardFetchSuccess = true;
        newState.studyboardFetchFailure = false;
        break;

      default:
        break;
    }
  });

export default StudyBoardReducer;
