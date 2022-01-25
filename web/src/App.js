import React from "react";
import { BrowserRouter, useHistory } from "react-router-dom";
import "./App.scss";
import CDASWrapper from "./CDASWrapper/CDASWrapper";
import AppProvider from "./components/Providers/AppProvider";
import MessageProvider from "./components/Providers/MessageProvider";

const App = () => {
  const history = useHistory();
  return (
    <>
      <AppProvider>
        <MessageProvider>
          <BrowserRouter basename="/" history={history}>
            <CDASWrapper />
          </BrowserRouter>
        </MessageProvider>
      </AppProvider>
    </>
  );
};

export default App;
