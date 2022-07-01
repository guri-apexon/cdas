import React from "react";
import Modal from "apollo-react/components/Modal";

const AlertBox = ({ cancel, submit }) => {
  return (
    <Modal
      open={true}
      onClose={cancel}
      disableBackdropClick={true}
      className="save-confirm"
      variant="warning"
      title="Lose your work?"
      message="All unsaved changes will be lost."
      buttonProps={[
        {
          label: "Keep editing",
          onClick: cancel,
          // disabled: loading,
        },
        {
          label: "Leave without saving",
          onClick: submit,
          // disabled: loading,
        },
      ]}
      id="neutral"
    />
  );
};

export default AlertBox;
