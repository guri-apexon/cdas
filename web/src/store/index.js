import { applyMiddleware, createStore, compose, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";
import StudyBoardReaducer from "./reducers/StudyBoardReducer";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

const appReducer = combineReducers({
  // launchPad: launchPadReducer,
  studyBoard: StudyBoardReaducer,
});

const rootReducer = (state, action) => {
  console.log(action);
  if (action.type === "LOGOUT_SUCCESS") {
    state = undefined;
  }
  return appReducer(state, action);
};

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware))
);

// sagaMiddleware.run(psatSaga);

export default store;
