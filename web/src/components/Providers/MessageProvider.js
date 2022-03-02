import React, { createContext, useCallback, useState } from "react";

export const MessageContext = createContext();

const MessageProvider = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState({
    variant: "",
    messages: "",
    show: false,
    top: 56,
  });

  const bannerCloseHandle = () => {
    setErrorMessage({ show: false });
  };

  const showErrorMessage = useCallback(
    (error, top = null, variant = "error") => {
      if (top !== null) {
        setErrorMessage({ top });
      }
      if (error && error.data) {
        const { message } = error.data;
        setErrorMessage({ variant, messages: message, show: true });
      } else {
        setErrorMessage({ variant, messages: error, show: true });
      }
      setTimeout(() => {
        setErrorMessage({ show: false });
      }, 7500);
    },
    [setErrorMessage]
  );

  const showSuccessMessage = useCallback(
    (message, top = null) => {
      if (top !== null) {
        setErrorMessage({ top });
      }
      setErrorMessage({ variant: "success", messages: message, show: true });
      setTimeout(() => {
        setErrorMessage({ show: false });
      }, 5000);
    },
    [setErrorMessage]
  );

  return (
    <MessageContext.Provider
      value={{
        errorMessage,
        showErrorMessage,
        bannerCloseHandle,
        showSuccessMessage,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export default MessageProvider;
