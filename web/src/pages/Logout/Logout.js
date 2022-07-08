import React from "react";
import Modal from "apollo-react/components/Modal";

import "./Logout.scss";
import { useHistory } from "react-router";

const Logout = () => {
  const history = useHistory();
  return (
    <div className="wrapper">
      <Modal
        open={true}
        disableBackdropClick={true}
        // variant="error"
        title="Logged out"
        message={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <>
            <div>Thank you for using the Clinical Data Analytics Suite.</div>
            <span>You are now logged out.</span>
          </>
        }
        id="errorLogout"
        buttonProps={[
          {
            label: "Return to Launchpad",
            variant: "primary",
            onClick: () => {
              history.push("/launchpad");
              window.location.reload();
            },
          },
        ]}
      />
    </div>
  );
};

export default Logout;
