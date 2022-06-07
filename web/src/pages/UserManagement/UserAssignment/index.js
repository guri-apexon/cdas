/* eslint-disable jsx-a11y/anchor-is-valid */
import { Typography } from "@material-ui/core";
import React, { useMemo, useState, useEffect, useContext } from "react";
import Paper from "apollo-react/components/Paper";
import Progress from "../../../components/Progress";
import "./index.scss";

import { AppContext } from "../../../components/Providers/AppProvider";

const ListUsers = () => {
  const [loading, setLoading] = useState(true);
  const [tableRows, setTableRows] = useState([]);
  const [initialTableRows, setInitialTableRows] = useState([]);
  const [initialSearchStr, setInitialSearchStr] = useState("");
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

  const Header = () => {
    return (
      <Paper>
        <div className="role-header">
          <Typography variant="h3">User Assignment</Typography>
        </div>
      </Paper>
    );
  };

  const renderPage = useMemo(
    () => <>{loading ? <Progress /> : <div>Coming Soon!</div>}</>,
    [loading, initialSearchStr]
  );

  return (
    <div className="role-container-wrapper">
      <Header />
      <div className="roles-table">
        {loading && <Progress />}
        {renderPage}
      </div>
    </div>
  );
};

export default ListUsers;
