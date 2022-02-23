/* eslint-disable no-script-url */
/* eslint-disable react/button-has-type */
import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Typography from "apollo-react/components/Typography";
import Table, {
  compareDates,
  compareNumbers,
  compareStrings,
} from "apollo-react/components/Table";
import Trash from "apollo-react-icons/Trash";
import IconButton from "apollo-react/components/IconButton";
import PlusIcon from "apollo-react-icons/Plus";
import Button from "apollo-react/components/Button";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import Paper from "apollo-react/components/Paper";
import Box from "apollo-react/components/Box";
import Grid from "apollo-react/components/Grid";
import "../OnboardStudy.scss";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import { getOnboardUsers, onboardStudy } from "../../../services/ApiServices";
import { getUserInfo } from "../../../utils";

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
  const selectedStudy = {
    prot_nbr: "DSJDK",
    spnsr_nm: "Sposnsor",
    proj_cd: "DSDSDSA",
    thptc_area: "Hello Area",
    prot_status: "Active",
    phase: "Phase",
  };
  const toast = useContext(MessageContext);
  const [tableUsers, setTableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState([]);
  const [roleLists, setroleLists] = useState([]);
  const Roles = useSelector((state) => state.Roles);
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
  // eslint-disable-next-line consistent-return
  const importWithAssign = () => {
    if (!tableUsers.length) {
      toast.showErrorMessage("Add some users to proceed");
      return false;
    }
    const reqBody = {
      users: tableUsers,
    };
    console.log("importWithAssign:", reqBody);
  };
  const editRow = (e, value, reason, index, key) => {
    console.log("editRow:", value, reason, index, key, tableUsers);
    // const row = tableUsers.find((x) => x.index === index);
    setTableUsers((rows) =>
      rows.map((row) => {
        if (row.index === index) {
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
        source={userList}
        value={row[key]}
        onChange={(e, v, r) => editRow(e, v, r, row.index, key)}
        error={!row[key]}
        helperText={!row[key] && "Required"}
      />
    );
  };
  const EditableRoles = ({ row, column: { accessor: key } }) => {
    return (
      <AutocompleteV2
        size="small"
        fullWidth
        multiple
        chipColor="white"
        source={[{ label: "Gurpreet" }, { label: "Gurpreet2" }]}
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

  const importStudy = async () => {
    const { spnsr_nm_stnd: sponsorNameStnd, prot_nbr_stnd: protNbrStnd } =
      selectedStudy;
    const reqBody = {
      sponsorNameStnd,
      protNbrStnd,
      userId: userInfo.user_id,
    };
    setLoading(true);
    const response = await onboardStudy(reqBody);
    setLoading(false);
    if (response.status === "BAD_REQUEST") {
      toast.showErrorMessage(response.message, 0);
    }
    if (response.status === "OK") {
      toast.showSuccessMessage(response.message, 0);
    }
  };
  const actionBtns = [
    {
      variant: "text",
      size: "small",
      label: "Import without assigning",
      onClick: importStudy,
    },
    {
      variant: "secondary",
      size: "small",
      label: "Cancel import",
      onClick: () => history.push("/study-setup"),
    },
    {
      variant: "primary",
      size: "small",
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
  const CustomHeader = ({ addNewUser }) => {
    return (
      <Button
        size="small"
        variant="secondary"
        icon={PlusIcon}
        onClick={addNewUser}
      >
        Add new users
      </Button>
    );
  };
  const addNewUser = () => {
    const userObj = {
      index: Math.max(...tableUsers.map((o) => o.index), 0) + 1,
      user: null,
      roles: [],
    };
    setTableUsers((u) => [...u, userObj]);
    console.log("Add User", userObj);
  };
  const onDelete = (index) => {
    setTableUsers(tableUsers.filter((row) => row.index !== index));
  };
  const getUserList = async () => {
    const result = await getOnboardUsers();
    console.log("result", result);
    const filtered = result.map((user) => {
      return {
        ...user,
        label: `${user.firstName} ${user.lastName} (${user.email})`,
      };
    });
    setUserList(filtered);
  };
  useEffect(() => {
    getUserList();
  }, []);
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
          <Grid item xs={9} className="user-table">
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
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default ImportWithUsers;
