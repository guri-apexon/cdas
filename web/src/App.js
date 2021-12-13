import React from "react";
import "./App.scss";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import CDASWrapper from "./components/CDASWrapper/CDASWrapper";
import AppProvider from "./components/AppProvider";
import MessageProvider from "./components/MessageProvider";

const App = (props) => {
  console.log('App-props: ', props)
  return (
    <React.Fragment>
      <AppProvider>
        <MessageProvider>
          <ErrorBoundary>
            <CDASWrapper />
          </ErrorBoundary>
        </MessageProvider>
      </AppProvider>
    </React.Fragment>
  );
};

export default App;
