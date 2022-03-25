import { withRouter } from "react-router";
import Modal from "apollo-react/components/Modal";
import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import "./AddNewUserModal.scss";
import Typography from "apollo-react/components/Typography";
import Table from "apollo-react/components/Table";
import Box from "apollo-react/components/Box";
import SearchIcon from "apollo-react-icons/Search";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import ApolloProgress from "apollo-react/components/ApolloProgress";
import { MessageContext } from "../Providers/MessageProvider";
import { searchStudy, onboardStudy } from "../../services/ApiServices";
import { debounceFunction, getUserInfo } from "../../utils";

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
const AddNewUserModal = ({ open, onClose }) => {
  const [openModal, setOpenModal] = useState(open);
  const [searchTxt, setSearchTxt] = useState("");
  const [tableUsers, setTableUsers] = useState([]);
  const [userList, setUserList] = useState([]);
  const [roleLists, setroleLists] = useState([]);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(false);
  const messageContext = useContext(MessageContext);
  const btnArr = [
    { label: "Cancel", size: "small", className: "cancel-btn" },
    { label: "Save", size: "small", className: "save-btn" },
  ];
  const userInfo = getUserInfo();
  const history = useHistory();
  const handleClose = () => {
    setOpenModal(false);
    onClose();
  };
  const importStudy = async () => {
    const reqBody = {};
    setLoading(true);
    const response = await onboardStudy(reqBody);
    setLoading(false);
    if (response.status === "BAD_REQUEST") {
      messageContext.showErrorMessage(response.message, 0);
    }
    if (response.status === "OK") {
      messageContext.showSuccessMessage(response.message, 0);
      handleClose();
    }
  };

  const editRow = (e, value, reason, index, key) => {
    let alreadyExist;
    if (key === "user" && value) {
      alreadyExist = tableUsers.find((x) => x.user?.email === value.email)
        ? true
        : false;
    }
    setTableUsers((rows) =>
      rows.map((row) => {
        if (row.index === index) {
          if (key === "user") {
            return { ...row, [key]: value, alreadyExist };
          }
          return { ...row, [key]: value };
        }
        return row;
      })
    );
  };

  const EditableRoles = ({ row, column: { accessor: key } }) => {
    return (
      <AutocompleteV2
        size="small"
        fullWidth
        multiple
        forcePopupIcon
        chipColor="white"
        source={roleLists}
        value={row[key]}
        onChange={(e, v, r) => editRow(e, v, r, row.index, key)}
        error={!row[key]}
        helperText={!row[key] && "Required"}
      />
    );
  };

  const EditableUser = ({ row, column: { accessor: key } }) => {
    return (
      <AutocompleteV2
        size="small"
        fullWidth
        forcePopupIcon
        popupIcon={<SearchIcon fontSize="extraSmall" />}
        source={userList}
        value={row[key]}
        onChange={(e, v, r) => editRow(e, v, r, row.index, key)}
        error={row.alreadyExist || !row[key]}
        helperText={
          row.alreadyExist
            ? "This user is already assigned"
            : !row[key] && "Required"
        }
      />
    );
  };

  const columns = [
    {
      header: "User",
      accessor: "user",
      customCell: EditableUser,
      width: "50%",
    },
    {
      header: "Role",
      accessor: "roles",
      customCell: EditableRoles,
      width: "50%",
    },
  ];

  const searchTrigger = (e) => {
    const newValue = e.target.value;
    setSearchTxt(newValue);
    debounceFunction(async () => {
      setLoading(true);
      const newStudies = await searchStudy(newValue);
      console.log("event", newValue, newStudies);
      setStudies(newStudies);
      setLoading(false);
    }, 1000);
  };
  useEffect(() => {
    setOpenModal(open);
    setStudies([]);
    setSearchTxt("");
  }, [open]);
  return (
    <>
      <Modal
        open={openModal}
        onClose={handleClose}
        title="Add New Users"
        buttonProps={btnArr}
        id="addNewUserModal"
        className="custom-modal"
      >
        <div className="modal-content">
          <>
            {loading ? (
              <Box display="flex" className="loader-container">
                <ApolloProgress />
              </Box>
            ) : (
              <Table
                columns={columns}
                rows={studies}
                rowId="employeeId"
                hidePagination
                maxHeight="40vh"
                emptyProps={{
                  text:
                    searchTxt === "" && !loading ? "" : "No data to display",
                }}
              />
            )}
          </>
        </div>
      </Modal>
    </>
  );
};

export default AddNewUserModal;
