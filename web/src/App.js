import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
import "./App.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import CDASWrapper from "./components/CDASWrapper";
import { CookiesProvider, useCookies } from "react-cookie";

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
