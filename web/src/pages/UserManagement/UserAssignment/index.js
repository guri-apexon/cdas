/* eslint-disable jsx-a11y/anchor-is-valid */
import { Typography } from "@material-ui/core";
import React, { useMemo, useState, useEffect, useContext } from "react";
import { useHistory } from "react-router";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Paper from "apollo-react/components/Paper";
import Switch from "apollo-react/components/Switch";
import Link from "apollo-react/components/Link";
import Tooltip from "apollo-react/components/Tooltip";
import PlusIcon from "apollo-react-icons/Plus";
import SearchIcon from "apollo-react-icons/Search";
import MenuItem from "apollo-react/components/MenuItem";
import Select from "apollo-react/components/Select";
import ArrowDown from "apollo-react-icons/ArrowDown";
import Button from "apollo-react/components/Button";
import Box from "apollo-react/components/Box";
import Search from "apollo-react/components/Search";
import Grid from "apollo-react/components/Grid";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import Autocomplete from "apollo-react/components/Autocomplete";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import Trash from "apollo-react-icons/Trash";
import Progress from "../../../components/Progress";

import "./index.scss";

import { AppContext } from "../../../components/Providers/AppProvider";

const ListUsers = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);
  const [initialTableRows, setInitialTableRows] = useState([]);
  const [initialSearchStr, setInitialSearchStr] = useState("");
  const [searchStr, setSearchStr] = useState("");
  const [matchFrom, setMatchFrom] = React.useState("any");
  const [inputValue, setInputValue] = React.useState("");
  const [userStudies, setUserStudies] = React.useState([]);
  const [userRoles, setUserRoles] = React.useState([]);
  const appContext = useContext(AppContext);
  const { permissions } = appContext.user;
  const [createRolePermission, setCreateRolePermission] = useState(false);
  const [readRolePermission, setReadRolePermission] = useState(false);
  const [updateRolePermission, setUpdateRolePermission] = useState(false);

  const filterMethod = (rolePermissions) => {
    const filterrolePermissions = rolePermissions.filter(
      (item) => item.featureName === "User Management"
    )[0];
    if (filterrolePermissions.allowedPermission.includes("Read")) {
      setReadRolePermission(true);
    }
    if (filterrolePermissions.allowedPermission.includes("Update")) {
      setUpdateRolePermission(true);
    }
    if (filterrolePermissions.allowedPermission.includes("Create")) {
      setCreateRolePermission(true);
    }
  };
  useEffect(() => {
    if (permissions.length > 0) {
      filterMethod(permissions);
    }
    setLoading(false);
  }, []);

  const users = [
    { label: "Niklesh Raut Niklesh Raut (niklesh.raut@iqvia.com)" },
    { label: "Vinit Maniyar Vinit Maniyar (vinit.maniyar@iqvia.com)" },
  ];

  const studies = ["Study A", "Study B", "Study C"];
  const roles = ["Role 1", "Role 2", "Role 3"];

  const breadcrumpItems = [
    { href: "", onClick: () => history.push("/launchpad") },
    {
      href: "",
      title: "User Management",
      onClick: () => history.push("/user-management"),
    },
    {
      title: "Add New User",
    },
  ];
  const handleActive = (e) => {
    console.log({ e });
  };
  const setConfirmCancel = (e) => {
    console.log({ e });
  };
  const submitRole = (e) => {
    console.log({ e });
  };
  const handleSearchChange = (e) => {
    console.log({ e });
  };
  const inviteNewUser = (e) => {
    console.log({ e });
  };
  const addUserAssignment = (e) => {
    console.log({ e });
  };
  const handleInputChange = (event, newValue, reason) => {
    if (reason !== "reset") {
      setInputValue(newValue);
    }
  };
  const handleChange = (event) => {
    setInputValue(event);
  };
  const handleChangeStudy = (event) => {
    console.log({ event });
    setUserStudies([...userStudies, event.target.value]);
  };
  const handleChangeRoles = (event, index) => {
    const tempUserRoles = userRoles;
    tempUserRoles[index] = event.target.value;
    setUserRoles([...tempUserRoles]);
  };

  const Header = () => {
    return (
      <Paper>
        <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
        <div className="user-assignment-header">
          <Typography variant="h3">Add New User</Typography>
        </div>
        <div className="user-assignment-form-header">
          <Switch
            label="Active"
            className="inline-checkbox"
            checked={active}
            onChange={handleActive}
            size="small"
          />
          <ButtonGroup
            alignItems="right"
            buttonProps={[
              {
                label: "Cancel",
                size: "small",
                onClick: () => setConfirmCancel(),
              },
              {
                label: "Save",
                size: "small",
                disabled: loading,
                onClick: submitRole,
              },
            ]}
          />
        </div>
      </Paper>
    );
  };

  const renderPage = useMemo(
    () => (
      <>
        {loading ? (
          <Progress />
        ) : (
          <div>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Box>
                  <div className="flex create-sidebar flexWrap">
                    <AutocompleteV2
                      label="Name"
                      placeholder="Search by name or email"
                      fullWidth
                      source={users}
                      value={inputValue}
                      onChange={handleChange}
                      chipColor="white"
                      size="small"
                      forcePopupIcon
                      blurOnSelect={false}
                      clearOnBlur={false}
                      disableCloseOnSelect
                      matchFrom={matchFrom}
                      popupIcon={<SearchIcon fontSize="extraSmall" />}
                    />
                  </div>
                  <div>
                    User not in the list?
                    <Link
                      className="invite-user-link"
                      onClick={(e) => inviteNewUser(e)}
                    >
                      Invite new user
                    </Link>
                  </div>
                </Box>
              </Grid>
              <Grid item xs={9}>
                <div className="user-assignment-wrapper">
                  <h4>User Assignments</h4>
                  <Button
                    size="small"
                    icon={PlusIcon}
                    onClick={() => addUserAssignment()}
                  >
                    Add new user
                  </Button>
                </div>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <div>
                      Protocol Number
                      <div>
                        {userStudies.map((userStudy) => (
                          <Select
                            key={userStudy}
                            value={userStudy}
                            onChange={(e) => handleChangeStudy(e)}
                            placeholder="Add new study and role"
                            fullWidth
                          >
                            {studies
                              .filter(
                                (e) =>
                                  userStudies.indexOf(e) === -1 ||
                                  e === userStudy
                              )
                              .map((study) => (
                                <MenuItem key={study} value={study}>
                                  {study}
                                </MenuItem>
                              ))}
                          </Select>
                        ))}
                        <Select
                          value=""
                          onChange={(e) => handleChangeStudy(e)}
                          placeholder="Add new study and role"
                          fullWidth
                        >
                          {studies
                            .filter((e) => userStudies.indexOf(e) === -1)
                            .map((study) => (
                              <MenuItem key={study} value={study}>
                                {study}
                              </MenuItem>
                            ))}
                        </Select>
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={8}>
                    Role
                    {userStudies.map((userStudy, index) => (
                      <Select
                        key={`userRole_${index + 1}`}
                        value={userRoles[index] || []}
                        onChange={(e) => handleChangeRoles(e, index)}
                        placeholder="Choose one or more roles"
                        fullWidth
                        multiple
                        showcheckboxes
                      >
                        {roles.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    ))}
                  </Grid>
                  <Grid item xs={1}>
                    <div className="user-assignment-blank-header"> </div>
                    {userStudies.map((userStudy, index) => (
                      <div>
                        <Trash className="user-assignment-trash" />
                      </div>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        )}
      </>
    ),
    [loading, initialSearchStr, inputValue, userStudies, userRoles]
  );

  return (
    <div className="user-assignment-container-wrapper">
      <Header />
      <div className="user-assignment-table">
        {loading && <Progress />}
        {renderPage}
      </div>
    </div>
  );
};

export default ListUsers;
