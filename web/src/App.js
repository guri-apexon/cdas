import React from "react";
import "./App.scss";

import CDASWrapper from "./components/CDASWrapper/CDASWrapper";
import AppProvider from "./components/AppProvider";
import MessageProvider from "./components/MessageProvider";

const App = (props) => {
  console.log(`props: ${props}`);
  return (
    <>
      <AppProvider>
        <MessageProvider>
          <CDASWrapper />
        </MessageProvider>
      </AppProvider>
    </>
  );
};

export default App;
