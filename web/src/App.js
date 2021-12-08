import React, { useState, useEffect } from "react";
import "./App.scss";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import CDASWrapper from "./components/CDASWrapper/CDASWrapper";

const App = (props) => {

  return (
    <React.Fragment>
        <ErrorBoundary>
          <CDASWrapper />
        </ErrorBoundary>
    </React.Fragment>
  );
};

export default App;
