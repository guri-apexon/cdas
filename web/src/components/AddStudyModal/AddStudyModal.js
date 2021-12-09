import { withRouter } from "react-router";
import Modal from 'apollo-react/components/Modal';
import { useState } from "react";
import './AddStudyModal.scss';
import { useEffect } from "react";
import Typography from "apollo-react/components/Typography";
import Search from 'apollo-react/components/Search';

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
    <>
            <Modal
            open={openModal}
            onClose={handleClose}
            title="Add New Study"
            buttonProps={[{}, { label: 'Next' }]}
            id="addStudyModal"
            className="custom-modal"
        >
          <div className="modal-content">
          <Typography variant="caption">Search for a study</Typography>
          <Search placeholder="Search" fullWidth />
          <h2>Hello</h2>
          </div>
          </Modal>
    </>
  );
};

const modalWrapper = {
}

export default withRouter(AddStudyModal);