/* eslint-disable consistent-return */
/* eslint-disable no-script-url */
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Typography from "apollo-react/components/Typography";
import Table from "apollo-react/components/Table";
import Trash from "apollo-react-icons/Trash";
import SearchIcon from "apollo-react-icons/Search";
import IconButton from "apollo-react/components/IconButton";
import PlusIcon from "apollo-react-icons/Plus";
import Button from "apollo-react/components/Button";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import Paper from "apollo-react/components/Paper";
import Box from "apollo-react/components/Box";
import Grid from "apollo-react/components/Grid";
import Modal from "apollo-react/components/Modal";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import { MessageContext } from "../../components/Providers/MessageProvider";
import {
  fetchRoles,
  getOnboardUsers,
  onboardStudy,
} from "../../services/ApiServices";
import { getUserInfo } from "../../utils";
import "./OnboardStudyWithUsers.scss";

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

const ImportWithUsers = () => {
  const history = useHistory();
  const userInfo = getUserInfo();
  const toast = useContext(MessageContext);
  const [tableUsers, setTableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmObj, setConfirmObj] = useState(null);
  const [userList, setUserList] = useState([]);
  const [roleLists, setroleLists] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState({});
  const [initialRender, setInitialRender] = useState(true);
  const breadcrumpItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/launchpad") },
    {
      href: "javascript:void(0)",
      title: "Study Setup",
      onClick: () => history.push("/study-setup"),
    },
    {
      title: "Assign Users",
    },
  ];
  const getUserObj = () => {
    return {
      index: Math.max(...tableUsers.map((o) => o.index), 0) + 1,
      user: null,
      roles: [],
    };
  };
  const editRow = (e, value, reason, index, key) => {
    let alreadyExist;
    if (value) {
      setInitialRender(true);
    } else {
      setInitialRender(false);
    }
    if (key === "user" && value) {
      alreadyExist = tableUsers.find((x) => x.user?.email === value.email)
        ? true
        : false;
    }
    const tableIndex = tableUsers.findIndex((el) => el.index === index);
    setTableUsers((rows) => {
      const newRows = rows.map((row) => {
        if (row.index === index) {
          if (key === "user") {
            return { ...row, [key]: value, alreadyExist };
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
  const EditableUser = ({ row, column: { accessor: key } }) => {
    return (
      <div className="user">
        <AutocompleteV2
          matchFrom="any"
          size="small"
          fullWidth
          forcePopupIcon
          popupIcon={<SearchIcon fontSize="extraSmall" />}
          source={userList}
          value={row[key]}
          onChange={(e, v, r) => editRow(e, v, r, row.index, key)}
          error={
            row.alreadyExist ||
            (!initialRender &&
              !row[key] &&
              row.index !== tableUsers[tableUsers.length - 1].index)
          }
          helperText={
            row.alreadyExist
              ? "This user already has assignments. Please select a different user to continue."
              : !initialRender &&
                !row[key] &&
                row.index !== tableUsers[tableUsers.length - 1].index &&
                "Required"
          }
        />
      </div>
    );
  };
  const EditableRoles = ({ row, column: { accessor: key } }) => {
    if (
      row.user === null &&
      row.index === tableUsers[tableUsers.length - 1]?.index
    )
      return false;
    return (
      <div className="role">
        <AutocompleteV2
          size="small"
          fullWidth
          multiple
          forcePopupIcon
          showCheckboxes
          chipColor="white"
          source={roleLists}
          limitChips={2}
          value={row[key]}
          onChange={(e, v, r) => editRow(e, v, r, row.index, key)}
          error={!row[key]}
          helperText={!row[key] && "Required"}
          filterSelectedOptions={false}
          blurOnSelect={false}
          clearOnBlur={false}
          disableCloseOnSelect
          alwaysLimitChips
        />
      </div>
    );
  };
  const DeleteUserCell = ({ row }) => {
    if (
      row.user === null &&
      row.index === tableUsers[tableUsers.length - 1]?.index
    )
      return false;
    const { index, onDelete } = row;
    return (
      <IconButton size="small" onClick={() => onDelete(index)}>
        <Trash />
      </IconButton>
    );
  };

  const importStudy = async (assign) => {
    const usersRows = [...tableUsers].slice(0, -1);
    if (assign) {
      if (!usersRows.length) {
        toast.showErrorMessage("Add some users to proceed");
        return false;
      }
      if (usersRows.find((x) => x.user == null)) {
        setInitialRender(!initialRender);
        setTableUsers([...tableUsers]);
        toast.showErrorMessage("Please fill user or remove blank rows");
        return false;
      }
      if (usersRows.find((x) => x.alreadyExist)) {
        toast.showErrorMessage("Please remove duplicate values");
        return false;
      }
      const emptyRoles = usersRows.filter((x) => x.roles.length === 0);
      if (emptyRoles.length) {
        toast.showErrorMessage(
          `This assignment is incomplete. Please select a user and a role to continue.`
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
      reqBody.users = usersRows;
    }
    setLoading(true);
    const response = await onboardStudy(reqBody);
    setLoading(false);
    if (response.status === "OK") {
      toast.showSuccessMessage(response.message, 0);
      history.push("/study-setup");
    } else {
      toast.showErrorMessage(response.message, 0);
    }
  };
  const importWithAssign = () => {
    importStudy(true);
  };
  const setConfirmCancel = () => {
    const confirm = {
      title: "Cancel Import?",
      subtitle: "This study has not been onboarded.",
      cancelLabel: "Cancel import",
      cancelAction: () => {
        history.push("/study-setup");
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
      width: "50%",
      customCell: EditableUser,
    },
    {
      header: "Role",
      accessor: "roles",
      width: "50%",
      customCell: EditableRoles,
    },
    {
      header: "",
      accessor: "delete",
      width: "40px",
      customCell: DeleteUserCell,
    },
  ];
  const CustomHeader = ({ focusLastUser }) => {
    return (
      <Button
        size="small"
        variant="secondary"
        icon={PlusIcon}
        onClick={(e) => {
          document
            .querySelector(".user-table tr:nth-last-child(2) .user input")
            .focus();
        }}
      >
        Add new users
      </Button>
    );
  };
  const addNewUser = () => {
    if (tableUsers.find((x) => x.user == null)) {
      setInitialRender(!initialRender);
      setTableUsers([...tableUsers]);
      toast.showErrorMessage(
        "Please fill user or remove blank rows to add new row"
      );
      return false;
    }
    const userObj = getUserObj();
    setTableUsers((u) => [...u, userObj]);
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
  useEffect(() => {
    console.log("tableUsers", tableUsers);
  }, [tableUsers]);
  useEffect(() => {
    const {
      location: { study },
    } = history;
    // const study = {
    //   prot_nbr: "CA212016",
    //   prot_nbr_stnd: "CA212016",
    //   spnsr_nm: "BRISTOL-MYERS SQUIBB  [JP]",
    //   spnsr_nm_stnd: "BRISTOLMYERSSQUIBBJP",
    //   proj_cd: "MYA12666",
    //   phase: "Phase 1",
    //   prot_status: "Enrolling",
    //   thptc_area: "CVT",
    //   ob_stat: null,
    // };
    if (!study) {
      history.push("/study-setup");
    } else {
      setSelectedStudy(study);
      getUserList();
    }
  }, []);
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
  return (
    <div className="import-with-users-wrapper">
      <Box className="onboard-header">
        <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
        <Typography variant="title1">Import and Assign Users</Typography>
      </Box>
      <Box px={4} py={4} className="">
        <ButtonGroup
          className="action-btns"
          alignItems="right"
          buttonProps={actionBtns}
        />
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Paper className="study-details">
              <Typography className="title" variant="title1">
                Importing and assigning users to:
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
                  <Value>{selectedStudy.proj_cd}</Value>
                </Box>
                <Box m={2}>
                  <Label>Protocol phase</Label>
                  <Value>{selectedStudy.phase}</Value>
                </Box>
                <Box m={2}>
                  <Label>Therapeutic area</Label>
                  <Value>{selectedStudy.thptc_area}</Value>
                </Box>
                <Box m={2}>
                  <Label>Protocol status</Label>
                  <Value>{selectedStudy.prot_status}</Value>
                </Box>
              </div>
            </Paper>
          </Grid>
          <Grid item xs={9}>
            <div className="user-table">{getTable}</div>
          </Grid>
        </Grid>
      </Box>
      {confirmObj && (
        <Modal
          open={confirmObj ? true : false}
          onClose={() => setConfirmObj(null)}
          disableBackdropClick="true"
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
  );
};

export default ImportWithUsers;
