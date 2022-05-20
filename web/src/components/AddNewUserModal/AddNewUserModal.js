/* eslint-disable consistent-return */
import Modal from "apollo-react/components/Modal";
import { useState, useEffect, useContext, useMemo } from "react";
import { useHistory, withRouter } from "react-router-dom";
import "./AddNewUserModal.scss";
import Table from "apollo-react/components/Table";
import IconButton from "apollo-react/components/IconButton";
import SearchIcon from "apollo-react-icons/Search";
import Trash from "apollo-react-icons/Trash";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import { MessageContext } from "../Providers/MessageProvider";
import { addAssignUser } from "../../services/ApiServices";
import { debounceFunction, getUserInfo } from "../../utils";

const AddNewUserModal = ({
  open,
  onClose,
  usersEmail,
  protocol,
  userList,
  roleLists,
  saveData,
  studyId,
}) => {
  const [openModal, setOpenModal] = useState(open);
  const [tableUsers, setTableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialRender, setInitialRender] = useState(true);
  const [disableSave, setDisableSave] = useState(false);
  const toast = useContext(MessageContext);
  const userInfo = getUserInfo();
  const history = useHistory();

  const DeleteUserCell = ({ row }) => {
    const { index, onDelete } = row;
    return (
      <IconButton
        className={row.disableRole ? "hide" : "show"}
        size="small"
        onClick={() => onDelete(index)}
      >
        <Trash />
      </IconButton>
    );
  };

  const getUserObj = () => {
    return {
      index: Math.max(...tableUsers.map((o) => o.index), 0) + 1,
      user: null,
      roles: [],
      disableRole: true,
    };
  };

  const addNewRow = () => {
    if (tableUsers.find((x) => x.user == null)) {
      const empty = tableUsers.filter((x) => x.user == null);
      if (empty.length > 1) {
        setTableUsers([...tableUsers]);
        return false;
      }
    }
    const userObj = getUserObj();
    setTableUsers((u) => [...u, userObj]);
  };
  const handleClose = () => {
    setDisableSave(false);
    setOpenModal(false);
    onClose();
    setTableUsers([]);
    // history.push("/study-setup");
  };
  const editRow = (e, value, reason, index, key) => {
    if (value) {
      setInitialRender(true);
    } else {
      setInitialRender(false);
    }
    let alreadyExist;
    let disableRole;
    if (key === "user" && value) {
      alreadyExist = tableUsers.find((x) => x.user?.email === value.email)
        ? true
        : false;
      if (!alreadyExist) {
        alreadyExist = usersEmail.find((x) => x === value.email) ? true : false;
      }
      disableRole = false;
    }
    const tableIndex = tableUsers.findIndex((el) => el.index === index);
    setTableUsers((rows) => {
      const newRows = rows.map((row) => {
        if (row.index === index) {
          if (key === "user") {
            return { ...row, [key]: value, alreadyExist, disableRole };
          }
          return { ...row, [key]: value };
        }
        return row;
      });
      if (
        !alreadyExist &&
        key === "user" &&
        value &&
        tableIndex + 1 === tableUsers.length
      ) {
        return [...newRows, getUserObj()];
      }
      return newRows;
    });
  };

  const onDelete = (index) => {
    setTableUsers((rows) => {
      const newRows = rows.filter((row) => row.index !== index);
      const tableIndex = tableUsers.findIndex((el) => el.index === index);
      if (tableIndex + 1 === tableUsers.length) {
        return [...newRows, getUserObj()];
      }
      return newRows;
    });
  };

  const EditableRoles = ({ row, column: { accessor: key } }) => {
    return (
      <div className="role">
        <AutocompleteV2
          size="small"
          fullWidth
          multiple
          forcePopupIcon
          showCheckboxes
          source={roleLists}
          limitChips={2}
          chipColor="white"
          className={row.disableRole ? "hide" : "show"}
          value={row[key]}
          onChange={(e, v, r) => editRow(e, v, r, row.index, key)}
          filterSelectedOptions={false}
          blurOnSelect={false}
          clearOnBlur={false}
          error={row.roles.length === 0 && row.user !== null}
          helperText={
            row.roles.length === 0 && row.user !== null && "Select a role"
          }
          disableCloseOnSelect
          alwaysLimitChips
        />
      </div>
    );
  };

  const EditableUser = ({ row, column: { accessor: key } }) => {
    return (
      <div className="user">
        <AutocompleteV2
          // open={(!row.user || (row.index === 1 && !row.user)) && true}
          size="small"
          fullWidth
          forcePopupIcon
          popupIcon={<SearchIcon fontSize="extraSmall" />}
          source={userList}
          value={row[key]}
          onChange={(e, v, r) => editRow(e, v, r, row.index, key)}
          matchFrom="any"
          error={
            row.alreadyExist ||
            (row.user === null && row.roles.length >= 1) ||
            (!initialRender &&
              !row[key] &&
              row.index !== tableUsers[tableUsers.length - 1].index)
          }
          helperText={
            row.alreadyExist
              ? "This user already has assignments. Please select a different user to continue"
              : ((row.user === null && row.roles.length >= 1) ||
                  (!initialRender &&
                    !row[key] &&
                    row.index !== tableUsers[tableUsers.length - 1].index)) &&
                "Select a User"
          }
        />
      </div>
    );
  };

  const columns = [
    {
      header: "User",
      accessor: "user",
      customCell: EditableUser,
      width: "430",
    },
    {
      header: "Role",
      accessor: "roles",
      customCell: EditableRoles,
      width: "430",
    },
    {
      header: "",
      accessor: "delete",
      width: "40px",
      customCell: DeleteUserCell,
    },
  ];

  useEffect(() => {
    setOpenModal(open);
  }, [open]);

  useEffect(() => {
    if (open) addNewRow();
  }, [open]);

  const getTable = useMemo(
    () => (
      <>
        <Table
          isLoading={loading}
          columns={columns}
          rows={tableUsers.map((row) => ({
            ...row,
            onDelete,
          }))}
          rowProps={{ hover: false }}
          hidePagination={true}
        />
      </>
    ),
    [tableUsers, userList]
  );

  const addUsers = async () => {
    setDisableSave(true);
    const usersRows = [...tableUsers].slice(0, -1);
    if (tableUsers.find((x) => x.alreadyExist)) {
      toast.showErrorMessage(
        `This user already has assignments. Please select a different user to continue`
      );
      setDisableSave(false);
      return false;
    }
    if (!usersRows.length) {
      toast.showErrorMessage("Add some users to proceed");
      setDisableSave(false);
      return false;
    }
    if (usersRows.find((x) => x.user == null)) {
      setInitialRender(!initialRender);
      setTableUsers([...tableUsers]);
      toast.showErrorMessage("Please fill user or remove blank rows");
      setDisableSave(false);
      return false;
    }
    if (tableUsers.find((x) => x.alreadyExist)) {
      toast.showErrorMessage(
        `This user already has assignments. Please select a different user to continue`
      );
      return false;
    }

    const emptyRoles = usersRows.filter((x) => x.roles.length === 0);
    if (emptyRoles.length) {
      toast.showErrorMessage(
        `This assignment is incomplete. Please select a user and a role to continue.`
        // `Please fill roles for ${
        //   emptyRoles[0] && emptyRoles[0].user && emptyRoles[0].user.email
        // }`
      );
      setDisableSave(false);
      return false;
    }
    setDisableSave(true);
    const data = tableUsers
      .filter((e) => e.user != null)
      .map((d) => {
        const newObj = {
          user_id: "",
          role_id: "",
        };
        newObj.user_id = d.user.userId;
        newObj.role_id = d.roles.map((e) => e.value).flat();
        return newObj;
      });
    const response = await addAssignUser({
      studyId,
      protocol,
      loginId: userInfo.user_id,
      data,
      insrt_tm: new Date().toISOString(),
    });
    setDisableSave(false);
    handleClose();
    setLoading(false);
    if (response.status === "BAD_REQUEST") {
      toast.showErrorMessage(response.message, 0);
    }
    if (response.status === "OK") {
      toast.showSuccessMessage(response.message, 0);
      // history.push("/study-setup");
    }
    saveData();
  };

  return (
    <>
      <Modal
        open={openModal}
        disableBackdropClick="true"
        onClose={handleClose}
        title="Add New Users"
        buttonProps={[
          {
            label: "Cancel",
            size: "small",
            className: "cancel-btn",
            onClick: () => handleClose(),
          },
          {
            disabled: disableSave,
            label: "Save",
            size: "small",
            className: "save-btn",
            onClick: () => {
              addUsers();
            },
          },
        ]}
        id="addNewUserModal"
        className="custom-modal"
      >
        <div className="modal-content">
          <>
            <div className="user-table">{getTable}</div>
          </>
        </div>
      </Modal>
    </>
  );
};

export default withRouter(AddNewUserModal);
