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
import ApolloProgress from "apollo-react/components/ApolloProgress";
import { MessageContext } from "../Providers/MessageProvider";
import { fetchRoles, getOnboardUsers } from "../../services/ApiServices";
import { debounceFunction, getUserInfo } from "../../utils";

const AddNewUserModal = ({ open, onClose }) => {
  const [openModal, setOpenModal] = useState(open);
  const [tableUsers, setTableUsers] = useState([]);
  const [userList, setUserList] = useState([]);
  const [roleLists, setroleLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useContext(MessageContext);
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

  const DeleteUserCell = ({ row }) => {
    const { index, onDelete } = row;
    return (
      <IconButton size="small" onClick={() => onDelete(index)}>
        <Trash />
      </IconButton>
    );
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

  useEffect(() => {
    setOpenModal(open);
  }, [open]);

  const getRoles = async () => {
    const result = await fetchRoles();
    setroleLists(result || []);
  };

  const getUserList = async () => {
    const result = await getOnboardUsers();
    const filtered =
      result?.map((user) => {
        return {
          ...user,
          label: `${user.firstName} ${user.lastName} (${user.email})`,
        };
      }) || [];
    filtered.sort(function (a, b) {
      if (a.firstName < b.firstName) {
        return -1;
      }
      if (a.firstName > b.firstName) {
        return 1;
      }
      return 0;
    });
    setUserList(filtered);
    getRoles();
  };

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (tableUsers.find((x) => x.user == null)) {
      setTableUsers([...tableUsers]);
      return false;
    }
    const userObj = {
      index: Math.max(...tableUsers.map((o) => o.index), 0) + 1,
      user: null,
      roles: [],
    };
    setTableUsers((u) => [...u, userObj]);
  }, []);

  const onDelete = (index) => {
    setTableUsers(tableUsers.filter((row) => row.index !== index));
  };

  const getTable = useMemo(
    () => (
      <>
        <Table
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
    [tableUsers]
  );

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
              <div className="user-table">{getTable}</div>
            )}
          </>
        </div>
      </Modal>
    </>
  );
};

export default AddNewUserModal;
