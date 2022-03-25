/* eslint-disable no-return-assign */
/* eslint-disable no-use-before-define */
/* eslint-disable consistent-return */
/* eslint-disable no-script-url */
/* eslint-disable react/button-has-type */
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, Link, useLocation } from "react-router-dom";
import FilterIcon from "apollo-react-icons/Filter";
import Table from "apollo-react/components/Table";
import SearchIcon from "apollo-react-icons/Search";
import PlusIcon from "apollo-react-icons/Plus";
import Button from "apollo-react/components/Button";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Box from "apollo-react/components/Box";
import Grid from "apollo-react/components/Grid";
import Modal from "apollo-react/components/Modal";
import ProjectHeader from "apollo-react/components/ProjectHeader";
import EllipsisVerticalIcon from "apollo-react-icons/EllipsisVertical";
import Tooltip from "apollo-react/components/Tooltip";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import "../OnboardStudy.scss";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import ChevronLeft from "apollo-react-icons/ChevronLeft";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import {
  fetchRoles,
  getOnboardUsers,
  onboardStudy,
  getAssignedUsers,
} from "../../../services/ApiServices";
import { getUserInfo } from "../../../utils";
import AddNewUserModal from "../../../components/AddNewUserModal/AddNewUserModal";

const ExistingUsers = () => {
  const history = useHistory();
  const userInfo = getUserInfo();
  const toast = useContext(MessageContext);

  const [tableUsers, setTableUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [confirmObj, setConfirmObj] = useState(null);

  const [userList, setUserList] = useState([]);
  const [roleLists, setroleLists] = useState([]);

  const [stateMenuItems, setStateMenuItems] = useState([]);
  const studyData = useSelector((state) => state.studyBoard);
  const [addStudyOpen, setAddStudyOpen] = useState(false);
  const { selectedStudy } = studyData;

  const getData = async (id) => {
    const data = await getAssignedUsers(id);
    const formattedData = await data.data.map((e, i) => {
      const userObj = {
        alreadyExist: false,
        editMode: false,
        indexId: i + 1,
        user: {
          userId: e.usr_id,
          firstName: e.usr_fst_nm,
          lastName: e.usr_lst_nm,
          email: e.usr_mail_id,
          label: `${e.usr_fst_nm} ${e.usr_lst_nm} (${e.usr_mail_id})`,
        },
        roles: e.roles.map((d) => ({ value: d.role_id, label: d.role_nm })),
      };
      return userObj;
    });
    setTableUsers([...formattedData]);
  };

  useEffect(() => {
    const updateData = [
      { label: "Protocol Number", value: selectedStudy?.protocolnumber },
      { label: "Sponsor", value: selectedStudy?.sponsorname },
      { label: "Phase", value: selectedStudy?.phase },
      { label: "Project Code", value: selectedStudy?.projectcode },
      { label: "Protocol Status", value: selectedStudy?.protocolstatus },
      { label: "Therapeutic Area", value: selectedStudy?.therapeuticarea },
    ];
    setStateMenuItems([...updateData]);
    getData(selectedStudy?.prot_id);
  }, [selectedStudy]);

  const breadcrumpItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/launchpad") },
    {
      href: "javascript:void(0)",
      title: "Study Setup",
      onClick: () => history.push("/study-setup"),
    },
    {
      title: "Manage Users",
    },
  ];

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

  const EditableUser = ({ row, column: { accessor: key } }) => {
    return row.editMode ? (
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
    ) : (
      row[key]
    );
  };

  const EditableRoles = ({ row, column: { accessor: key } }) => {
    return row.editMode ? (
      // return (
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
    ) : (
      // );
      row[key]
    );
  };

  const ActionCell = ({ row }) => {
    const {
      indexId,
      onRowEdit,
      onRowSave,
      editMode,
      onCancel,
      editedRow,
      onRowDelete,
    } = row;
    const menuItems = [
      { text: "Edit", id: 1, onClick: () => onRowEdit(row.indexId) },
      { text: "Delete", id: 2, onClick: () => onRowDelete(row.indexId) },
    ];
    return editMode ? (
      <div style={{ marginTop: 8, whiteSpace: "nowrap" }}>
        <Button size="small" style={{ marginRight: 8 }} onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="primary"
          onClick={onRowSave}
          disabled={
            Object.values(editedRow).some((item) => !item) ||
            (editMode &&
              !Object.keys(editedRow).some(
                (key) => editedRow[key] !== row[key]
              ))
          }
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
    {
      accessor: "action",
      customCell: ActionCell,
      align: "right",
    },
  ];

  const CustomHeader = ({ toggleFilters }) => {
    return (
      <>
        <AddNewUserModal
          open={addStudyOpen}
          onClose={() => setAddStudyOpen(false)}
        />
        <div>
          <Button
            size="small"
            variant="secondary"
            icon={PlusIcon}
            onClick={() => setAddStudyOpen(!addStudyOpen)}
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

  const addNewUser = () => {
    if (tableUsers.find((x) => x.user == null)) {
      toast.showErrorMessage(
        "Please fill user or remove blank rows to add new row"
      );
      return false;
    }
    const userObj = {
      index: Math.max(...tableUsers.map((o) => o.index), 0) + 1,
      user: null,
      roles: [],
    };
    setTableUsers((u) => [...u, userObj]);
  };

  const getRoles = async () => {
    const result = await fetchRoles();
    setroleLists(result || []);
    addNewUser();
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

  const onRowDelete = (index) => {
    setTableUsers(tableUsers.filter((row) => row.index !== index));
  };

  const onRowEdit = (index) => {
    const tempTable = tableUsers.filter((row) => row.index !== index);
    const selected = tableUsers.find((row) => row.index === index);
    selected.editMode = true;
    setTableUsers([...tempTable, selected]);
  };

  const backToSearch = () => {
    // setSelectedStudy(null);
  };

  const importStudy = async (assign) => {
    if (assign) {
      if (!tableUsers.length) {
        toast.showErrorMessage("Add some users to proceed");
        return false;
      }
      if (tableUsers.find((x) => x.user == null)) {
        toast.showErrorMessage("Please fill user or remove blank rows");
        return false;
      }
      if (tableUsers.find((x) => x.alreadyExist)) {
        toast.showErrorMessage("Please remove duplicate values");
        return false;
      }
      const emptyRoles = tableUsers.filter((x) => x.roles.length === 0);
      if (emptyRoles.length) {
        toast.showErrorMessage(
          `Please fill roles for ${emptyRoles[0].user.email}`
        );
        return false;
      }
    }
    const { spnsr_nm_stnd: sponsorNameStnd, prot_nbr_stnd: protNbrStnd } =
      selectedStudy;
    const reqBody = {
      sponsorNameStnd,
      protNbrStnd,
      userId: userInfo.user_id,
    };
    if (assign) {
      reqBody.users = tableUsers;
    }
    setLoading(true);
    const response = await onboardStudy(reqBody);
    setLoading(false);
    if (response.status === "BAD_REQUEST") {
      toast.showErrorMessage(response.message, 0);
    }
    if (response.status === "OK") {
      toast.showSuccessMessage(response.message, 0);
      // history.push("/study-setup");
    }
  };
  const importWithAssign = () => {
    importStudy(true);
  };
  const setConfirmCancel = () => {
    const confirm = {
      title: "Cancel Import?",
      subtitle: "This study has not been onboarded.",
      cancelLabel: "Cancel Import",
      cancelAction: () => {
        // history.push("/study-setup");
      },
      submitAction: () => {
        setConfirmObj(null);
      },
      submitLabel: "Return to assignments",
    };
    setConfirmObj(confirm);
  };
  const setConfirmWithoutUser = () => {
    const confirm = {
      title: "Import without Assignments?",
      subtitle: "This study has not been onboarded.",
      cancelLabel: "Import study without assignment",
      cancelAction: () => {
        importStudy();
      },
      submitAction: () => {
        setConfirmObj(null);
      },
      submitLabel: "Don't import - return to assignments",
    };
    setConfirmObj(confirm);
  };

  const actionBtns = [
    {
      variant: "text",
      size: "small",
      disabled: loading,
      label: "Import without assigning",
      onClick: setConfirmWithoutUser,
    },
    {
      variant: "secondary",
      size: "small",
      label: "Cancel import",
      disabled: loading,
      onClick: setConfirmCancel,
    },
    {
      variant: "primary",
      size: "small",
      disabled: loading,
      label: "Import and assign",
      onClick: importWithAssign,
    },
  ];

  return (
    <>
      <div className="container">
        <ProjectHeader
          menuItems={stateMenuItems}
          maxCellWidth={280}
          style={{ height: 64, zIndex: 998 }}
        />
      </div>
      <div className="existing-study-wrapper">
        <div className="top-content">
          <Box className="onboard-header">
            <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
          </Box>
          <div className="header-title">Manage Users</div>
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
              Back to Study Setup
            </Button>
          </Link>
          <Grid item xs={12}>
            <div className="user-table">
              <Table
                title="User Assignments"
                columns={columns}
                rowId="indexId"
                rows={tableUsers.map((row) => ({
                  ...row,
                }))}
                rowProps={{ hover: false }}
                hidePagination={true}
                CustomHeader={CustomHeader}
                headerProps={{ addNewUser }}
              />
            </div>
          </Grid>
        </div>
        {confirmObj && (
          <Modal
            open={confirmObj ? true : false}
            onClose={() => setConfirmObj(null)}
            className="save-confirm"
            variant="warning"
            title={confirmObj.title}
            message={confirmObj.subtitle}
            buttonProps={[
              {
                label: confirmObj.cancelLabel,
                onClick: confirmObj.cancelAction,
                disabled: loading,
              },
              {
                label: confirmObj.submitLabel,
                onClick: confirmObj.submitAction,
                disabled: loading,
              },
            ]}
            id="neutral"
          />
        )}
      </div>
    </>
  );
};

export default ExistingUsers;
