import { withRouter } from "react-router";
import Modal from 'apollo-react/components/Modal';
import { useState } from "react";
import './AddStudyModal.scss';
import { useEffect } from "react";

const AddStudyModal = ({
    history,
    location: { pathname },
    open,
    onClose,
  }) => {
    const [openModal, setOpenModal] = useState(open);
    const handleClose = () => {
        setOpenModal(false);
        onClose();
      };
      useEffect(() => {
        setOpenModal(open);
      }, [open]);
  return (
    <div style={modalWrapper}>
            <Modal
            open={openModal}
            onClose={handleClose}
            title="Add New Study"
            buttonProps={[{}, { label: 'Next' }]}
            id="addStudyModal"
        >
          <h2>Hello</h2>
          </Modal>
    </div>
  );
};

const modalWrapper = {
}

export default withRouter(AddStudyModal);