/* eslint-disable jsx-a11y/anchor-is-valid */
import { Typography } from "@material-ui/core";
import React, { useMemo, useState, useEffect, useContext } from "react";
import Paper from "apollo-react/components/Paper";
import { useHistory } from "react-router-dom";
import Table, {
  createSelectFilterComponent,
  createStringSearchFilter,
  compareStrings,
} from "apollo-react/components/Table";
import Button from "apollo-react/components/Button";
import PlusIcon from "apollo-react-icons/Plus";
import Peek from "apollo-react/components/Peek";
import FilterIcon from "apollo-react-icons/Filter";
import Link from "apollo-react/components/Link";
import Switch from "apollo-react/components/Switch";
import Tooltip from "apollo-react/components/Tooltip";
import Progress from "../../../components/Progress";
import {
  TextFieldFilter,
  createStringArraySearchFilter,
  createStringArrayIncludedFilter,
  getOverflowLimit,
} from "../../../utils/index";
import "./index.scss";

import { AppContext } from "../../../components/Providers/AppProvider";
import { getUsers } from "../../../services/ApiServices";

const ProductsCell = ({ row, column: { accessor } }) => {
  const rowValue = row[accessor];
  return <>{rowValue}</>;
};

const statusList = ["Active", "Inactive"];

const ListRoles = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [tableRows, setTableRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [peekContent, setPeekContent] = useState("");
  const [curRow, setCurRow] = useState({});
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
      setTableRows(u.rows);
      setLoading(false);
    });
  }, []);

  const handleStatus = async (e, userId) => {
    try {
      const prevUsers = tableRows;
      const selectedUserIndex = prevUsers.findIndex(
        (user) => user.usr_id === userId
      );
      prevUsers[selectedUserIndex].usr_stat = e.target.checked
        ? "Active"
        : "Inactive";
      setTableRows([...prevUsers]);
    } catch (error) {
      console.log("error", error);
    }
  };

  const goToRole = (e, id) => {
    if (readRolePermission) {
      e.preventDefault();
      history.push(`/role-management/${id}`);
    }
  };

  const handleMouseOut = () => {
    setOpen(false);
    setPeekContent("");
  };

  const handleMouseOver = (row, peekData) => {
    setOpen(!open);
    setPeekContent(peekData);
    setCurRow(row);
  };

  const StatusCell = ({ row, column: { accessor } }) => {
    const data = row[accessor];
    const id = row.usr_id;
    const stat = row.usr_stat === "Active" ? true : false;
    return (
      <Tooltip
        title={data === "Active" ? "Active" : "Inactive"}
        disableFocusListener
      >
        <Switch
          className="table-checkbox"
          checked={stat}
          onChange={(e) => handleStatus(e, id)}
          size="small"
          disabled={!updateRolePermission}
        />
      </Tooltip>
    );
  };

  const LinkCell = ({ row, column: { accessor, width } }) => {
    const rowValue = row[accessor];
    const id = row.role_id;
    if (!rowValue) return null;
    const charLimit = getOverflowLimit(width, 100);
    if (rowValue.length < charLimit) {
      return (
        <Link disabled={!readRolePermission} onClick={(e) => goToRole(e, id)}>
          {rowValue}
        </Link>
      );
    }
    return (
      <Link
        onMouseOver={() => handleMouseOver(row, "roleName")}
        onMouseOut={handleMouseOut}
        disabled={!readRolePermission}
        onClick={(e) => goToRole(e, id)}
      >
        {`${rowValue.slice(0, charLimit - 10)} [...]`}
      </Link>
    );
  };

  const DespCell = ({ row, column: { accessor, width } }) => {
    const data = row[accessor];
    const charLimit = getOverflowLimit(width, 100);
    if (!data) return null;
    if (data.length < charLimit) {
      return <>{data}</>;
    }
    return (
      <>
        {data.slice(0, charLimit - 6)}
        <Link
          onMouseOver={() => handleMouseOver(row, "roleDes")}
          onMouseOut={handleMouseOut}
        >
          {` [...]`}
        </Link>
      </>
    );
  };

  const CustomButtonHeader = ({ toggleFilters }) => (
    <div>
      {createRolePermission && (
        <Button
          size="small"
          variant="secondary"
          icon={PlusIcon}
          onClick={() => history.push("/create-role")}
          style={{ marginRight: "8px", border: "none", boxShadow: "none" }}
        >
          Create new role
        </Button>
      )}
      <Button
        size="small"
        variant="secondary"
        icon={FilterIcon}
        onClick={toggleFilters}
      >
        Filter
      </Button>
    </div>
  );

  const columns = [
    {
      header: "",
      accessor: "user_id",
      hidden: true,
    },
    {
      header: "Name",
      accessor: "usr_full_nm",
      customCell: LinkCell,
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("usr_full_nm"),
      filterComponent: TextFieldFilter,
      width: "20%",
    },
    {
      header: "Email",
      accessor: "usr_mail_id",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("usr_mail_id"),
      filterComponent: TextFieldFilter,
      customCell: DespCell,
      width: "40%",
    },
    {
      header: "Employee ID",
      accessor: "usr_id",
      customCell: ProductsCell,
      sortFunction: compareStrings,
      filterFunction: createStringArrayIncludedFilter("usr_id"),
      filterComponent: createSelectFilterComponent([], {
        size: "small",
        multiple: true,
      }),
      width: "30%",
    },
    {
      header: "Status",
      accessor: "usr_stat",
      customCell: StatusCell,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("usr_stat"),
      filterComponent: createSelectFilterComponent(statusList, {
        size: "small",
        multiple: true,
      }),
      width: "10%",
    },
  ];

  const Header = () => {
    return (
      <Paper>
        <div className="role-header">
          <Typography variant="h3">User Management</Typography>
        </div>
      </Paper>
    );
  };

  const renderTable = useMemo(
    () => (
      <>
        {loading ? (
          <Progress />
        ) : (
          <Table
            isLoading={loading}
            title="Users"
            columns={columns}
            rows={tableRows}
            rowId="user_id"
            hasScroll={true}
            maxHeight="calc(100vh - 162px)"
            initialSortedColumn="usr_full_nm"
            initialSortOrder="asc"
            rowsPerPageOptions={[10, 50, 100, "All"]}
            tablePaginationProps={{
              labelDisplayedRows: ({ from, to, count }) =>
                `${count === 1 ? "Item " : "Items"} ${from}-${to} of ${count}`,
              truncate: true,
            }}
            showFilterIcon
            CustomHeader={(props) => <CustomButtonHeader {...props} />}
          />
        )}
      </>
    ),
    [tableRows, loading]
  );

  return (
    <div className="role-container-wrapper">
      <Header />
      <div className="roles-table">
        {loading && <Progress />}
        {tableRows.length > 0 ? renderTable : null}
      </div>
      <Peek
        open={open}
        followCursor
        placement="bottom"
        content={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <div style={{ maxWidth: 400 }}>
            <Typography variant="body2">
              {peekContent === "roleName" && curRow.role_nm}
              {peekContent === "roleDes" && curRow.role_desc}
            </Typography>
          </div>
        }
      />
    </div>
  );
};

export default ListRoles;
