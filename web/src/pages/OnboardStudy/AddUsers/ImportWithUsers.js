/* eslint-disable no-script-url */
/* eslint-disable react/button-has-type */
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Typography from "apollo-react/components/Typography";
import Table, {
  compareDates,
  compareNumbers,
  compareStrings,
} from "apollo-react/components/Table";
import PlusIcon from "apollo-react-icons/Plus";
import Button from "apollo-react/components/Button";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import Paper from "apollo-react/components/Paper";
import Box from "apollo-react/components/Box";
import Grid from "apollo-react/components/Grid";
import "../OnboardStudy.scss";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";

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
  const selectedStudy = {
    prot_nbr: "DSJDK",
    spnsr_nm: "Sposnsor",
    proj_cd: "DSDSDSA",
    thptc_area: "Hello Area",
    prot_status: "Active",
    phase: "Phase",
  };
  const [users, setUsers] = useState([]);
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
  const EditableUser = ({ row, column: { accessor: key } }) => {
    return (
      <AutocompleteV2
        size="small"
        fullWidth
        source={[{ label: "Gurpreet" }]}
        // value={row[key]}
        onChange={(e) => row.editRow(row.index, key, e.target.value)}
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
        // value={row[key]}
        onChange={(e) => row.editRow(row.index, key, e.target.value)}
        error={!row[key]}
        helperText={!row[key] && "Required"}
      />
    );
  };
  const actionBtns = [
    {
      variant: "text",
      size: "small",
      label: "Import without assigning",
    },
    {
      variant: "secondary",
      size: "small",
      label: "Cancel import",
    },
    {
      variant: "primary",
      size: "small",
      label: "Import and assign",
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
      index: Math.max(...users.map((o) => o.index), 0) + 1,
      user: null,
      roles: [],
    };
    setUsers((u) => [...u, userObj]);
    console.log("Add User", userObj);
  };
  const onDelete = (userId) => {
    setUsers(users.filter((row) => row.userId !== userId));
  };
  const editRow = (index, key, value) => {
    setUsers((rows) =>
      rows.map((row) => (row.index === index ? { ...row, [key]: value } : row))
    );
  };
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
              rows={users.map((row) => ({
                ...row,
                onDelete,
                editRow,
              }))}
              rowProps={{ hover: false }}
              hidePagination={false}
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
