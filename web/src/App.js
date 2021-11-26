import React from "react";
// import { useDispatch } from "react-redux";
import './App.css';
import { ErrorBoundary } from "./components/ErrorBoundary";
import CDASWrapper from "./components/CDASWrapper";


function App() {
  return (
    <React.Fragment>
      <ErrorBoundary>
        <CDASWrapper />
      </ErrorBoundary>
    </React.Fragment>
  );
}

export default App;
