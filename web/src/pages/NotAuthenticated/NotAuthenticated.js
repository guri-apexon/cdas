import React, { useState } from "react";
import Modal from "apollo-react/components/Modal";

import "./NotAuthenticated.scss";

const NotAuthenticated = () => {
  const [isError, setIsError] = useState(true);
  return (
    <div className="wrapper">
      <Modal
        open={isError}
        variant="error"
        onClose={() => setIsError(false)}
        title="Not logged in"
        message="For product access, contact your Administrator."
        buttonProps={[]}
        id="error"
      />
    </div>
  );
};

export default NotAuthenticated;
