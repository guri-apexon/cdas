/* eslint-disable consistent-return */
/* eslint-disable no-script-url */
/* eslint-disable react/button-has-type */
import React, { useContext, useEffect, useState } from "react";
// import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, Link, useLocation } from "react-router-dom";
import Typography from "apollo-react/components/Typography";
import FilterIcon from "apollo-react-icons/Filter";
import Table from "apollo-react/components/Table";
import Trash from "apollo-react-icons/Trash";
import SearchIcon from "apollo-react-icons/Search";
import IconButton from "apollo-react/components/IconButton";
import PlusIcon from "apollo-react-icons/Plus";
import Button from "apollo-react/components/Button";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Box from "apollo-react/components/Box";
import Grid from "apollo-react/components/Grid";
import Modal from "apollo-react/components/Modal";
import ProjectHeader from "apollo-react/components/ProjectHeader";
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

const Label = ({ children }) => {
  return (
    <Typography className="label" variant="body2">
      {children}
    </Typography>
  );
};
const Value = ({ children }) => {
  return (
    <Typography className="value b-font" variant="body2">
      {children}
    </Typography>
  );
};

const ExistingUsers = () => {
  const location = useLocation();
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
    console.log("dat", data.data);
    const formattedData = data.data.map((e) => e);
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
  const DeleteUserCell = ({ row }) => {
    const { index, onDelete } = row;
    return (
      <IconButton size="small" onClick={() => onDelete(index)}>
        <Trash />
      </IconButton>
    );
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

  const columns = [
    {
      header: "User",
      accessor: "user",
      customCell: EditableUser,
    },
    {
      header: "Role",
      accessor: "roles",
      customCell: EditableRoles,
    },
    {
      header: "",
      accessor: "delete",
      width: 40,
      customCell: DeleteUserCell,
    },
  ];
  const CustomHeader = ({ addNewUser, toggleFilters }) => {
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
            onClick={addNewUser}
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
  const onDelete = (index) => {
    setTableUsers(tableUsers.filter((row) => row.index !== index));
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

  const getTable = React.useMemo(
    () => (
      <>
        <Table
          title="User Assignments"
          columns={columns}
          rows={tableUsers.map((row) => ({
            ...row,
            onDelete,
          }))}
          rowProps={{ hover: false }}
          hidePagination={true}
          CustomHeader={CustomHeader}
          headerProps={{ addNewUser }}
        />
      </>
    ),
    [tableUsers]
  );
  const backToSearch = () => {
    // setSelectedStudy(null);
  };

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
            <div className="user-table">{getTable}</div>
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
