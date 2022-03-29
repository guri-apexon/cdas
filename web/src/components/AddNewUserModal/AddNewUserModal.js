/* eslint-disable consistent-return */
import Modal from "apollo-react/components/Modal";
import { useState, useEffect, useContext, useMemo } from "react";
import { useHistory } from "react-router-dom";
import "./AddNewUserModal.scss";
import Table from "apollo-react/components/Table";
import Box from "apollo-react/components/Box";
import IconButton from "apollo-react/components/IconButton";
import SearchIcon from "apollo-react-icons/Search";
import Trash from "apollo-react-icons/Trash";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import Select from "apollo-react/components/Select";
import MenuItem from "apollo-react/components/MenuItem";
import ApolloProgress from "apollo-react/components/ApolloProgress";
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
}) => {
  const [openModal, setOpenModal] = useState(open);
  const [tableUsers, setTableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useContext(MessageContext);

  const userInfo = getUserInfo();
  const history = useHistory();
  const handleClose = () => {
    setOpenModal(false);
    onClose();
  };

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

  const addNewRow = () => {
    if (tableUsers.find((x) => x.user == null)) {
      const empty = tableUsers.filter((x) => x.user == null);
      if (empty.length > 1) {
        setTableUsers([...tableUsers]);
        return false;
      }
    }
    const userObj = {
      index: Math.max(...tableUsers.map((o) => o.index), 0) + 1,
      user: null,
      roles: [],
      disableRole: true,
    };
    setTableUsers((u) => [...u, userObj]);
  };

  const editRow = (e, value, reason, index, key) => {
    let alreadyExist;
    let disableRole;
    if (key === "user" && value) {
      alreadyExist = tableUsers.find((x) => x.user?.email === value.email)
        ? true
        : false;
      if (!alreadyExist) {
        alreadyExist = usersEmail.find(
          (x) => x.usersEmail?.email === value.email
        )
          ? true
          : false;
      }
      disableRole = false;
      addNewRow();
    }
    setTableUsers((rows) =>
      rows.map((row) => {
        if (row.index === index) {
          if (key === "user") {
            return { ...row, [key]: value, alreadyExist, disableRole };
          }
          return { ...row, [key]: value };
        }
        return row;
      })
    );
  };

  const onDelete = (index) => {
    setTableUsers(tableUsers.filter((row) => row.index !== index));
  };

  const EditableRoles = ({ row, column: { accessor: key } }) => {
    return (
      <AutocompleteV2
        size="small"
        fullWidth
        multiple
        forcePopupIcon
        source={roleLists}
        chipColor="white"
        className={row.disableRole ? "hide" : "show"}
        value={row[key]}
        onChange={(e, v, r) => editRow(e, v, r, row.index, key)}
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
        error={row.alreadyExist}
        helperText={
          row.alreadyExist &&
          "This user already as assignments. Please select a different user to continue"
        }
      />
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
    addNewRow();
  }, []);

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
      protocol,
      loginId: userInfo.user_id,
      data,
    });
    handleClose();
    setLoading(false);
    if (response.status === "BAD_REQUEST") {
      toast.showErrorMessage(response.message, 0);
    }
    if (response.status === "OK") {
      toast.showSuccessMessage(response.message, 0);
      history.push("/study-setup");
    }
    saveData();
  };

  return (
    <>
      <Modal
        open={openModal}
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

export default AddNewUserModal;
