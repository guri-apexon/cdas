import { applyMiddleware, createStore, compose, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

const appReducer = combineReducers({});

const rootReducer = (state, action) => {
  console.log(action);
  if (action.type === "LOGOUT_SUCCESS") {
    localStorage.clear();
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
