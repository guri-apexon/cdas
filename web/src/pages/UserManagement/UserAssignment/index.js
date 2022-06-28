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
import { getUsers, getStudies, getRoles } from "../../../services/ApiServices";

import "./index.scss";

import { AppContext } from "../../../components/Providers/AppProvider";

const ListUsers = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);
  const [initialTableRows, setInitialTableRows] = useState([]);
  const [userList, setUserList] = useState([]);
  const [studyList, setStudyList] = useState([]);
  const [roleList, setRoleList] = useState([]);
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
    getUsers().then((u) => {
      const users = u.rows.map((e) => ({
        label: `${e.usr_fst_nm} ${e.usr_lst_nm} (${e.usr_mail_id})`,
      }));
      setUserList([...users]);
      setLoading(false);
    });
    getStudies().then((s) => {
      const study = s?.data?.studyData.map((e) => e.protocolnumber);
      setStudyList(study);
    });

    getRoles().then((s) => {
      const roles = s?.data?.roles.map((e) => e.role_nm);
      setRoleList(roles);
    });
  }, []);

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
  const handleChange = (value) => {
    setInputValue(value);
  };
  const handleChangeStudy = (event) => {
    const newStudy = {
      name: event.target.value,
      roles: [],
    };
    const tempUserStudies = userStudies;
    tempUserStudies.push(newStudy);
    setUserStudies([...tempUserStudies]);
  };
  const handleChangeRoles = (event, index) => {
    const tempUserStudies = userStudies;
    console.log(tempUserStudies[index]);
    tempUserStudies[index].roles = event.target.value;
    setUserStudies([...tempUserStudies]);
  };
  const removeStudy = (index) => {
    console.log({ index });
    const tempUserStudies = userStudies;
    tempUserStudies.splice(index, 1);
    setUserStudies([...tempUserStudies]);
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
                      source={userList}
                      value={inputValue}
                      onChange={(e, v) => handleChange(v)}
                      chipColor="white"
                      size="small"
                      forcePopupIcon
                      blurOnSelect={false}
                      clearOnBlur={false}
                      disableCloseOnSelect
                      matchFrom={matchFrom}
                      popupIcon={<SearchIcon fontSize="extraSmall" />}
                      limitChips={1}
                      alwaysLimitChips
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
                  <h4>User Assignments1</h4>
                  <Button
                    size="small"
                    icon={PlusIcon}
                    onClick={() => addUserAssignment()}
                  >
                    Add user assignment
                  </Button>
                </div>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    Protocol Number
                  </Grid>
                  <Grid item xs={9}>
                    Role
                  </Grid>
                </Grid>
                {userStudies.map((userStudy, userStudyIndex) => (
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Select
                        key={userStudy.name}
                        value={userStudy.name}
                        onChange={(e) => handleChangeStudy(e)}
                        placeholder="Add new study and role"
                        fullWidth
                      >
                        {studyList
                          .filter(
                            (e) =>
                              userStudies.map((u) => u.name).indexOf(e) ===
                                -1 || e === userStudy.name
                          )
                          .map((study) => (
                            <MenuItem key={study} value={study}>
                              {study}
                            </MenuItem>
                          ))}
                      </Select>
                    </Grid>
                    <Grid item xs={8}>
                      <Select
                        key={`userRole_${userStudyIndex + 1}`}
                        value={userStudy.roles || []}
                        onChange={(e) => handleChangeRoles(e, userStudyIndex)}
                        placeholder="Choose one or more roles"
                        fullWidth
                        multiple
                        showcheckboxes={true}
                      >
                        {roleList.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid item xs={1}>
                      <Trash
                        key={`userTrash_${userStudyIndex + 1}`}
                        onClick={(e) => removeStudy(userStudyIndex)}
                        className="user-assignment-trash"
                      />
                    </Grid>
                  </Grid>
                ))}
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Select
                      value=""
                      onChange={(e) => handleChangeStudy(e)}
                      placeholder="Add new study and role"
                      fullWidth
                    >
                      {studyList
                        .filter(
                          (e) =>
                            userStudies.map((u) => u.name).indexOf(e) === -1
                        )
                        .map((study) => (
                          <MenuItem key={study} value={study}>
                            {study}
                          </MenuItem>
                        ))}
                    </Select>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        )}
      </>
    ),
    [loading, initialSearchStr, inputValue, userStudies, roleList, userList]
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
