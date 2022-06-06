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
import TextField from "apollo-react/components/TextField";
import Progress from "../../../components/Progress";
import {
  TextFieldFilter,
  createStringArraySearchFilter,
  getOverflowLimit,
} from "../../../utils/index";
import "./index.scss";

import { AppContext } from "../../../components/Providers/AppProvider";
import { getUsers } from "../../../services/ApiServices";

const ProductsCell = ({ row, column: { accessor } }) => {
  const rowValue = row[accessor];
  return <>{rowValue}</>;
};

const statusList = ["Active", "In Active", "Invited"];

const ListUsers = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [tableRows, setTableRows] = useState([]);
  const [initialTableRows, setInitialTableRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [peekContent, setPeekContent] = useState("");
  const [searchStr, setSearchStr] = useState("");
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
      setInitialTableRows(u.rows);
      setLoading(false);
    });
  }, []);

  const goToUser = (e, id) => {
    if (readRolePermission) {
      e.preventDefault();
      history.push(`/user-management/${id}`);
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

  const handleSearchChange = (e) => {
    console.log({ e: e.target.value });
    setSearchStr(e.target.value);
    if (e.target.value) {
      const prevTableRows = tableRows.filter(
        (row) =>
          row.usr_full_nm.includes(e.target.value) ||
          row.usr_id.includes(e.target.value) ||
          row.usr_mail_id.includes(e.target.value)
      );
      setTableRows([...prevTableRows]);
    } else {
      setTableRows([...initialTableRows]);
    }
  };

  const StatusCell = ({ row, column: { accessor } }) => {
    const data = row[accessor];
    // const id = row.usr_id;
    const btnVariant = {
      Active: "primary",
      "In Active": "primary",
      Invited: "primary",
    };
    const btnBgColor = {
      Active: "#00C221",
      "In Active": "#999999",
      Invited: "#9E54B0",
    };
    return (
      <div>
        <Button
          size="small"
          variant={btnVariant[row.trimed_usr_stat]}
          onClick={() => history.push("/create-user")}
          style={{
            marginRight: "8px",
            boxShadow: "none",
            backgroundColor: btnBgColor[row.trimed_usr_stat],
          }}
        >
          {row.trimed_usr_stat}
        </Button>
      </div>
    );
  };

  const LinkCell = ({ row, column: { accessor, width } }) => {
    const rowValue = row[accessor];
    const id = row.role_id;
    if (!rowValue) return null;
    const charLimit = getOverflowLimit(width, 100);
    if (rowValue.length < charLimit) {
      return (
        <Link disabled={!readRolePermission} onClick={(e) => goToUser(e, id)}>
          {rowValue}
        </Link>
      );
    }
    return (
      <Link
        onMouseOver={() => handleMouseOver(row, "roleName")}
        onMouseOut={handleMouseOut}
        disabled={!readRolePermission}
        onClick={(e) => goToUser(e, id)}
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
      <TextField
        placeholder="Search by name, email, or user ID"
        size="small"
        value={searchStr}
        onChange={(e) => handleSearchChange(e)}
        style={{ minWidth: "400px", marginTop: -7 }}
      />
      {createRolePermission && (
        <Button
          size="small"
          variant="secondary"
          icon={PlusIcon}
          onClick={() => history.push("/create-user")}
          style={{ marginRight: "8px", border: "none", boxShadow: "none" }}
        >
          Add new user
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
      filterFunction: createStringSearchFilter("usr_id"),
      filterComponent: TextFieldFilter,
      width: "30%",
    },
    {
      header: "Status",
      accessor: "trimed_usr_stat",
      customCell: StatusCell,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("trimed_usr_stat"),
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
        {renderTable}
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

export default ListUsers;
