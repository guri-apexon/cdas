import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
import { CookiesProvider, useCookies } from "react-cookie";

import "./App.scss";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import CDASWrapper from "./components/CDASWrapper/CDASWrapper";


const App = (props) => {
  const [cookies, setCookie, removeCookie] = useCookies(["user.id"]);
  if (cookies !== "") {
    // userData.id = cookies;
  }

  return (
    <React.Fragment>
      <CookiesProvider>
        <ErrorBoundary>
          <CDASWrapper />
        </ErrorBoundary>
      </CookiesProvider>
    </React.Fragment>
  );
};

export default App;
