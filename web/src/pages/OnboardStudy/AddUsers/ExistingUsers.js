/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-return-assign */
/* eslint-disable no-use-before-define */
/* eslint-disable consistent-return */
/* eslint-disable no-script-url */
/* eslint-disable react/button-has-type */
import React, { useContext, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, Link, useLocation } from "react-router-dom";
import FilterIcon from "apollo-react-icons/Filter";
import Table, {
  createStringSearchFilter,
  createSelectFilterComponent,
  compareStrings,
} from "apollo-react/components/Table";
import PlusIcon from "apollo-react-icons/Plus";
import Modal from "apollo-react/components/Modal";
import Button from "apollo-react/components/Button";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Box from "apollo-react/components/Box";
import Grid from "apollo-react/components/Grid";
import ProjectHeader from "apollo-react/components/ProjectHeader";
import EllipsisVerticalIcon from "apollo-react-icons/EllipsisVertical";
import Tooltip from "apollo-react/components/Tooltip";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import Peek from "apollo-react/components/Peek";
import Typography from "apollo-react/components/Typography";
import ChevronLeft from "apollo-react-icons/ChevronLeft";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import {
  fetchRoles,
  getAssignedUsers,
  getOnboardUsers,
  updateAssignUser,
  deleteAssignUser,
} from "../../../services/ApiServices";
import {
  getUserInfo,
  TextFieldFilter,
  createStringArrayIncludedFilter,
  getOverflowLimit,
} from "../../../utils";
import AddNewUserModal from "../../../components/AddNewUserModal/AddNewUserModal";
import "./ExistingUsers.scss";
import {
  formComponentActive,
  hideAlert,
  showAppSwitcher,
  formComponentInActive,
  hideAppSwitcher,
} from "../../../store/actions/AlertActions";
import AlertBox from "../../AlertBox/AlertBox";

const ActionCell = ({ row }) => {
  const { uniqueId, onRowEdit, onRowSave, editMode, onCancel, onRowDelete } =
    row;
  const menuItems = [
    { text: "Edit", onClick: () => onRowEdit(uniqueId) },
    { text: "Delete", onClick: () => onRowDelete(uniqueId) },
  ];
  return editMode ? (
    <div style={{ marginTop: 8, whiteSpace: "nowrap" }}>
      <Button
        size="small"
        style={{ marginRight: 8 }}
        onClick={() => onCancel(uniqueId)}
      >
        Cancel
      </Button>
      <Button
        size="small"
        variant="primary"
        onClick={() => onRowSave(uniqueId)}
      >
        Save
      </Button>
    </div>
  ) : (
    <Tooltip title="Actions" disableFocusListener>
      <IconMenuButton id="actions" menuItems={menuItems} size="small">
        <EllipsisVerticalIcon />
      </IconMenuButton>
    </Tooltip>
  );
};

const ConfirmModal = React.memo(({ confirmObj, cancel, cstmCancelBtn }) => {
  return (
    <Modal
      open={confirmObj}
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
        },
        {
          label: "Leave without saving",
          onClick: cstmCancelBtn,
        },
      ]}
      id="neutral"
    />
  );
});

const ExistingUsers = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const userInfo = getUserInfo();
  const toast = useContext(MessageContext);
  const [tableUsers, setTableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleLists, setroleLists] = useState([]);
  const [userList, setUserList] = useState([]);
  const [uniqueRoles, setUniqueRoles] = useState([]);
  const [stateMenuItems, setStateMenuItems] = useState([]);
  const studyData = useSelector((state) => state.studyBoard);
  const [addStudyOpen, setAddStudyOpen] = useState(false);
  const [peekData, setPeekData] = useState(null);
  const { selectedStudy } = studyData;
  const { prot_id: protocol, prot_nbr_stnd: studyId } = selectedStudy;
  const [targetRoute, setTargetRoute] = useState("");
  const [confirmObj, setConfirmObj] = useState(false);
  const routerHandle = useRef();
  const alertStore = useSelector((state) => state.Alert);
  const [isShowAlertBox, setShowAlertBox] = useState(false);
  const [rowsBeingEdited, setRowsBeingEdited] = useState([]);
  const [editedRowBeingCancelled, setEditedRowBeingCancelled] = useState(null);
  const [isAddNewModalClick, setAddNewModalClick] = useState(false);
  const unblockRouter = () => {
    dispatch(formComponentInActive());
    dispatch(hideAlert());
    dispatch(hideAppSwitcher());
    if (routerHandle) {
      routerHandle.current();
    }
  };

  const getData = async (id) => {
    setLoading(true);
    const data = await getAssignedUsers(id);
    const forTable = data.data.list.map((e, i) => ({
      alreadyExist: false,
      editMode: false,
      uniqueId: i + 1,
      fName: e.usr_fst_nm,
      lName: e.usr_lst_nm,
      user: `${e.usr_fst_nm} ${e.usr_lst_nm} (${e.usr_mail_id})`,
      userId: e.usr_id,
      email: e.usr_mail_id,
      roles: e.roles.map((d) => ({ value: d.role_id, label: d.role_nm })),
      roleList: e.roleList.join(", "),
    }));
    setTableUsers(forTable);
    setUniqueRoles(data.data.uniqueRoles);
    setLoading(false);
  };

  useEffect(() => {
    const updateData = [
      { label: "Protocol Number", value: selectedStudy?.protocolnumber },
      { label: "Sponsor", value: selectedStudy?.sponsorname },
      { label: "Phase", value: selectedStudy?.phase },
      { label: "Project Code", value: selectedStudy?.projectcode },
      { label: "Study status", value: selectedStudy?.protocolstatus },
      { label: "Therapeutic Area", value: selectedStudy?.therapeuticarea },
    ];
    setStateMenuItems([...updateData]);
    getData(protocol);
  }, [selectedStudy]);

  const breadcrumpItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/launchpad") },
    {
      href: "javascript:void(0)",
      title: "Study Setup",
      onClick: () => history.push("/study-setup"),
    },
    {
      title: "Manage Study Assignments",
    },
  ];

  const getRoles = async () => {
    const result = await fetchRoles();
    setroleLists(result || []);
  };

  const saveFromModal = () => {
    getData(protocol);
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
  };

  useEffect(() => {
    if (!selectedStudy?.protocolnumber) {
      history.push("/study-setup");
    }
    getRoles();
    getUserList();
  }, []);

  const editRowData = (e, value, reason, uniqueId, key) => {
    setTableUsers((rows) =>
      rows.map((row) => {
        if (row.uniqueId === uniqueId) {
          return { ...row, [key]: value };
        }
        return row;
      })
    );
  };

  const EditableRoles = ({ row }) => {
    const key = "roles";
    const rowValue = row[key].map((e) => e.label).join(", ");
    if (row.editMode) {
      return (
        <AutocompleteV2
          size="small"
          fullWidth
          multiple
          forcePopupIcon
          showCheckboxes
          chipColor="white"
          style={{ marginTop: 8 }}
          source={roleLists}
          limitChips={2}
          value={row[key]}
          onChange={(e, v, r) => editRowData(e, v, r, row.uniqueId, key)}
          error={!row[key]}
          helperText={!row[key] && "Required"}
          alwaysLimitChips
          filterSelectedOptions={false}
          blurOnSelect={false}
          clearOnBlur={false}
          disableCloseOnSelect
          enableVirtualization
        />
      );
    }
    const charLimit = getOverflowLimit("50%", 360);
    if (rowValue.length > charLimit) {
      return (
        <>
          {rowValue.slice(0, charLimit - 5)}
          <Link
            onMouseOver={() => setPeekData(rowValue)}
            onMouseOut={() => setPeekData(null)}
          >
            {` [...]`}
          </Link>
        </>
      );
    }
    return rowValue;
  };
  // rowValue.slice(0, 100)
  const UsersCell = ({ row }) => {
    return row.editMode ? (
      <div style={{ marginTop: 12 }}>
        <b>{`${row.fName} ${row.lName} `}</b>
        {row.email}
      </div>
    ) : (
      <>
        <div>
          <b>{`${row.fName} ${row.lName} `}</b>
          {row.email}
        </div>
      </>
    );
  };

  const onRowDelete = async (uniqueId) => {
    const selected = await tableUsers.find((row) => row.uniqueId === uniqueId);
    const response = await deleteAssignUser({
      studyId,
      protocol,
      loginId: userInfo.user_id,
      users: [selected.userId],
      updt_tm: new Date().toISOString(),
    });
    setLoading(false);
    if (response.status === "BAD_REQUEST") {
      toast.showErrorMessage(response.message, 0);
    }
    if (response.status === "OK") {
      toast.showSuccessMessage(response.message, 0);
    }
    setTableUsers(tableUsers.filter((row) => row.uniqueId !== uniqueId));
  };

  const onRowEdit = async (uniqueId) => {
    const rbe = [...rowsBeingEdited];
    rbe.push(tableUsers[uniqueId - 1]);
    setRowsBeingEdited(rbe);
    dispatch(formComponentActive());
  };

  const onRowSave = async (uniqueId) => {
    const updateData = tableUsers.find(
      // (e) => e.uniqueId === editedRow.uniqueId
      (e) => e.uniqueId === uniqueId
    );
    if (updateData && updateData.roles && updateData.roles.length === 0) {
      toast.showErrorMessage(`Please fill roles for ${updateData.email}`);
      return false;
    }
    const response = await updateAssignUser({
      studyId,
      protocol,
      loginId: userInfo.user_id,
      data: [
        {
          user_id: updateData.userId,
          role_id: updateData.roles.map((e) => e.value).flat(),
        },
      ],
      updt_tm: new Date().toISOString(),
    });
    if (response.status === "BAD_REQUEST") {
      toast.showErrorMessage(response.message, 0);
    }
    if (response.status === "OK") {
      toast.showSuccessMessage(response.message, 0);
      // history.push("/study-setup");
    }
    removeFromRowsBeingEdited(uniqueId);

    getData(protocol);
    dispatch(hideAlert());
    dispatch(formComponentInActive());
  };

  const onCancel = (uniqueId) => {
    if (rowsBeingEdited.length) {
      setEditedRowBeingCancelled(
        rowsBeingEdited.find(({ uniqueId: uid }) => uniqueId === uid)
      );
      setShowAlertBox(true);
    }
  };

  // const editRow = (key, value) => {
  //   setEditedRow({ ...editedRow, [key]: value });
  // };

  const columns = [
    {
      header: "User",
      accessor: "user",
      customCell: UsersCell,
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("user"),
      filterComponent: TextFieldFilter,
      width: "50%",
    },
    {
      header: "Role",
      accessor: "roleList",
      customCell: EditableRoles,
      filterFunction: createStringArrayIncludedFilter("roleList"),
      filterComponent: createSelectFilterComponent(uniqueRoles, {
        size: "small",
        multiple: true,
      }),
      width: "50%",
    },
    {
      accessor: "action",
      customCell: ActionCell,
      align: "right",
    },
  ];

  const addNewUserCstmBtnClick = () => {
    if (rowsBeingEdited?.length) {
      setAddNewModalClick(true);
    } else {
      setAddStudyOpen(!addStudyOpen);
    }
  };
  const CustomHeader = ({ toggleFilters }) => {
    return (
      <>
        <div>
          <Button
            size="small"
            variant="secondary"
            icon={PlusIcon}
            onClick={() => addNewUserCstmBtnClick()}
            style={{ marginRight: 16 }}
          >
            Add new users
          </Button>
          <Button
            size="small"
            variant="secondary"
            icon={FilterIcon}
            onClick={toggleFilters}
            // disabled={rows.length <= 0}
          >
            Filter
          </Button>
        </div>
      </>
    );
  };

  const backToSearch = () => {
    history.push("/study-setup");
  };

  const closeConfirm = () => {
    setConfirmObj(false);
  };

  const cancelButton = () => {
    unblockRouter();
    if (targetRoute === "") {
      setConfirmObj(false);
    } else {
      let tempRoute;
      if (targetRoute.includes("ExistingStudyAssignment")) {
        tempRoute = "/study-setup";
      } else {
        tempRoute = targetRoute;
      }
      history.push(tempRoute);
    }
  };

  const keepEditingBtn = () => {
    setAddNewModalClick(false);
    dispatch(hideAlert());
    setShowAlertBox(false);
  };

  const removeFromRowsBeingEdited = (uniqueId) => {
    const rbe = [...rowsBeingEdited];
    const index = rbe.findIndex(({ uniqueId: uid }) => uid === uniqueId);
    rbe.splice(index, 1);
    setRowsBeingEdited(rbe);
  };
  /* eslint-disable */
  const leavePageBtnForAddUser = () => {
    console.log(rowsBeingEdited);
    const revertedData = rowsBeingEdited.reduce((acc, obj) => {
      /* eslint-disable */
      return acc.map((row) => {
        if (row.uniqueId === obj.uniqueId) {
          return {
            ...row,
            roles: obj.roles,
          };
        } else {
          return row;
        }
      });
    }, tableUsers);
    setTableUsers(revertedData);
    setRowsBeingEdited([]);
    dispatch(formComponentInActive());
    setAddNewModalClick(false);
    setAddStudyOpen(true);
  };

  const leavePageBtn = () => {
    const checkVariable = alertStore?.showAlertBox !== true;
    if (editedRowBeingCancelled && checkVariable) {
      console.log(editedRowBeingCancelled);
      if (editedRowBeingCancelled?.roles) {
        setTableUsers((rows) =>
          rows.map((row) => {
            if (row.uniqueId === editedRowBeingCancelled?.uniqueId) {
              return {
                ...row,
                roles: editedRowBeingCancelled.roles,
              };
            }
            return row;
          })
        );
        removeFromRowsBeingEdited(editedRowBeingCancelled?.uniqueId);
        setEditedRowBeingCancelled(null);
      }
      setShowAlertBox(false);
      dispatch(formComponentInActive());
      dispatch(hideAppSwitcher());
    } else if (alertStore?.showAlertBox) {
      dispatch(hideAlert());
      setShowAlertBox(false);
      dispatch(showAppSwitcher());
    }
  };

  useEffect(() => {
    if (alertStore?.showAlertBox) {
      setShowAlertBox(true);
    }
  }, [alertStore]);

  useEffect(() => {
    if (rowsBeingEdited.length) {
      routerHandle.current = history.block((tr) => {
        setConfirmObj(true);
        setTargetRoute(tr?.pathname);
        return false;
      });

      return function () {
        /* eslint-disable */
        routerHandle.current = history.block(() => {});
        routerHandle.current();
      };
    }
  });

  return (
    <>
      <div className="container">
        <ProjectHeader
          menuItems={stateMenuItems}
          maxCellWidth={280}
          style={{ height: 64, zIndex: 10 }}
        />
      </div>
      {isAddNewModalClick && (
        <AlertBox cancel={keepEditingBtn} submit={leavePageBtnForAddUser} />
      )}

      {isShowAlertBox && (
        <AlertBox cancel={keepEditingBtn} submit={leavePageBtn} />
      )}
      {confirmObj && (
        <ConfirmModal
          confirmObj={confirmObj}
          cancel={closeConfirm}
          cstmCancelBtn={cancelButton}
        ></ConfirmModal>
      )}
      <AddNewUserModal
        open={addStudyOpen}
        onClose={() => setAddStudyOpen(false)}
        usersEmail={tableUsers.map((e) => e.email)}
        protocol={protocol}
        userList={userList}
        roleLists={roleLists}
        saveData={saveFromModal}
        studyId={studyId}
      />
      <div className="existing-study-wrapper">
        <div className="top-content">
          <Box className="onboard-header">
            <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
          </Box>
          <div className="header-title">Manage Study Assignments</div>
        </div>
        <div className="bottom-content">
          <Link to="/study-setup" className="removeUnderLine">
            <Button
              className="back-btn"
              variant="text"
              size="small"
              onClick={backToSearch}
            >
              <ChevronLeft style={{ width: 12, marginRight: 5 }} width={10} />
              Back to Study List
            </Button>
          </Link>
          <Grid item xs={12}>
            <div className="user-table">
              <Table
                isLoading={loading}
                title="User Assignments"
                columns={columns}
                rowId="uniqueId"
                rows={tableUsers.map((row) => ({
                  ...row,
                  onRowEdit,
                  onRowDelete,
                  onRowSave,
                  onCancel,
                  // editMode: editedRow.uniqueId === row.uniqueId,
                  editMode: rowsBeingEdited?.some(
                    ({ uniqueId: uid }) => uid === row?.uniqueId
                  ),
                }))}
                initialSortedColumn="user"
                initialSortOrder="asc"
                rowProps={{ hover: false }}
                hidePagination={true}
                CustomHeader={CustomHeader}
              />
            </div>
          </Grid>
        </div>
      </div>
      {peekData && (
        <Peek
          open={peekData}
          id="rolesTooltip"
          followCursor
          placement="bottom"
          content={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <Typography variant="body" gutterBottom>
              {peekData}
            </Typography>
          }
        />
      )}
    </>
  );
};

export default ExistingUsers;
