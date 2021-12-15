import { withRouter } from "react-router";
import Modal from "apollo-react/components/Modal";
import { useState, useEffect } from "react";
import "./AddStudyModal.scss";
import Typography from "apollo-react/components/Typography";
import Search from "apollo-react/components/Search";
import Table from "apollo-react/components/Table";
import Box from "apollo-react/components/Box";
import Button from "apollo-react/components/Button";
import ChevronLeft from "apollo-react-icons/ChevronLeft";
import ApolloProgress from "apollo-react/components/ApolloProgress";

import searchStudy from "../../services/ApiServices";
import Highlighted from "../Common/Highlighted";

const Label = ({ children }) => {
  return (
    <Typography className="label" variant="body2">
      {children}
    </Typography>
  );
};
const Value = ({ children }) => {
  return (
    <Typography className="value" variant="body2">
      {children}
    </Typography>
  );
};
const AddStudyModal = ({ open, onClose }) => {
  const [openModal, setOpenModal] = useState(open);
  const [searchTxt, setSearchTxt] = useState("");
  const [studies, setStudies] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [loading, setLoading] = useState(false);

  const setDetail = (study) => {
    setSelectedStudy(study);
  };

  const FormatCell = ({ row, column: { accessor } }) => {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div onClick={() => setDetail(row)} role="menu" tabIndex={0}>
        <Highlighted text={row[accessor]} highlight={searchTxt} />
      </div>
    );
  };

  const columns = [
    {
      header: "Protocol Number",
      accessor: "prot_nbr",
      customCell: FormatCell,
    },
    {
      header: "Sponsor",
      accessor: "spnsr_nm",
      customCell: FormatCell,
    },
    {
      header: "Project Code",
      accessor: "project_code",
      customCell: FormatCell,
    },
  ];
  const handleClose = () => {
    setOpenModal(false);
    onClose();
  };
  const backToSearch = () => {
    setSelectedStudy(null);
  };
  const searchTrigger = async (e) => {
    if (e.key === "Enter") {
      setLoading(true);
      // eslint-disable-next-line no-shadow
      const newStudies = await searchStudy(searchTxt);
      console.log("event", searchTxt, newStudies);
      setStudies(newStudies);
      setLoading(false);
    }
  };
  useEffect(() => {
    setOpenModal(open);
    setSelectedStudy(null);
    setStudies([]);
    setSearchTxt("");
  }, [open]);
  return (
    <>
      <Modal
        open={openModal}
        onClose={handleClose}
        title="Add New Study"
        buttonProps={[{}]}
        id="addStudyModal"
        className="custom-modal"
      >
        <div className="modal-content">
          {selectedStudy ? (
            <>
              <Button
                className="back-btn"
                variant="text"
                size="small"
                onClick={backToSearch}
              >
                <ChevronLeft style={{ width: 12, marginRight: 5 }} width={10} />
                Back to search
              </Button>
              <Typography className="title" variant="title2">
                Verify this is the study you want to import
              </Typography>
              <div className="detail-list">
                <Box m={2}>
                  <Label>Protocol number</Label>
                  <Value>{selectedStudy.prot_nbr}</Value>
                </Box>
                <Box m={2}>
                  <Label>Sponsor name</Label>
                  <Value>{selectedStudy.spnsr_nm}</Value>
                </Box>
                <Box m={2}>
                  <Label>Project code</Label>
                  <Value>{selectedStudy.project_code}</Value>
                </Box>
                <Box m={2}>
                  <Label>Protocol phase</Label>
                  <Value>{selectedStudy.phase}</Value>
                </Box>
                <Box m={2}>
                  <Label>Theraputic area</Label>
                  <Value>{selectedStudy.thptc_area}</Value>
                </Box>
                <Box m={2}>
                  <Label>Protocol status</Label>
                  <Value>{selectedStudy.prot_status}</Value>
                </Box>
              </div>
            </>
          ) : (
            <>
              <Typography variant="caption">Search for a study</Typography>
              {/* <form onSubmit={searchTrigger}> */}
              <Search
                onKeyDown={searchTrigger}
                placeholder="Search"
                value={searchTxt}
                onChange={(e) => setSearchTxt(e.target.value)}
                fullWidth
              />
              {/* </form> */}
              {loading ? (
                <Box display="flex" className="loader-container">
                  <ApolloProgress />
                </Box>
              ) : (
                <Table
                  hasScroll={true}
                  isSticky={true}
                  columns={columns}
                  rows={studies}
                  rowId="employeeId"
                  hidePagination
                  maxHeight="40vh"
                />
              )}
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default withRouter(AddStudyModal);
