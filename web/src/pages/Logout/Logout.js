import React, { useState } from "react";
import Modal from "apollo-react/components/Modal";

import "./Logout.scss";

const Logout = () => {
  const [isError, setIsError] = useState(true);

  return (
    <div className="wrapper">
      <Modal
        open={isError}
        variant="error"
        onClose={() => setIsError(false)}
        title="Logged Out"
        message="Thank you for using the Clinical Data Analytics Suite. You are now logged out."
        buttonProps={[]}
        id="error"
      />
    </div>
  );
};

export default Logout;
