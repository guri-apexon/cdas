/* eslint-disable jsx-a11y/anchor-is-valid */
import _debounce from "lodash/debounce";
import { useDispatch } from "react-redux";
import { Typography } from "@material-ui/core";
import React, {
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
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
import Tag from "apollo-react/components/Tag";
import Search from "apollo-react/components/Search";
import Progress from "../../../components/Progress";
import {
  TextFieldFilter,
  createStringArraySearchFilter,
  getOverflowLimit,
} from "../../../utils/index";
import "./index.scss";

import { AppContext } from "../../../components/Providers/AppProvider";
import { getUsers } from "../../../services/ApiServices";

import usePermission, {
  Categories,
  Features,
} from "../../../components/Common/usePermission";

// import { createUser } from "../../../store/actions/UserActions";

const ProductsCell = ({ row, column: { accessor } }) => {
  const rowValue = row[accessor];
  return <>{rowValue}</>;
};

const statusList = ["Active", "Inactive", "Invited"];

const ListUsers = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [tableRows, setTableRows] = useState([]);
  const [initialTableRows, setInitialTableRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [peekContent, setPeekContent] = useState("");
  const [initialSearchStr, setInitialSearchStr] = useState("");
  const [curRow, setCurRow] = useState({});
  const searchRef = useRef();
  const appContext = useContext(AppContext);
  const dispatch = useDispatch();

  const { permissions } = appContext.user;
  const [createRolePermission, setCreateRolePermission] = useState(false);
  const [readRolePermission, setReadRolePermission] = useState(false);
  const [updateRolePermission, setUpdateRolePermission] = useState(false);

  const { canCreate } = usePermission(
    Categories.MENU,
    Features.USER_MANAGEMENT
  );

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
    e.preventDefault();
    history.push(`/user-management/${id}`);
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
    const btnVariant = {
      active: "green",
      inactive: "grey",
      invited: "purple",
    };
    let variantKey = row?.formatted_stat || "";
    variantKey = variantKey.replaceAll(" ", "").trim().toLowerCase();
    return (
      <div>
        {row.formatted_stat && (
          <Tag
            className={`user-tag-capitalized user-tag-${btnVariant[variantKey]}`}
            label={variantKey}
            variant={btnVariant[variantKey]}
          />
        )}
      </div>
    );
  };

  const LinkCell = ({ row, column: { accessor, width } }) => {
    const rowValue = row[accessor];
    const id = row.usr_id;
    if (!rowValue) return null;
    const charLimit = getOverflowLimit(width, 100);
    if (rowValue.length < charLimit) {
      return <Link onClick={(e) => goToUser(e, id)}>{rowValue}</Link>;
    }
    return (
      <Link
        onMouseOver={() => handleMouseOver(row, "roleName")}
        onMouseOut={handleMouseOut}
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

  const debounceFn = useCallback(
    _debounce((str) => {
      const formattedStr = str.trim().toLowerCase();
      if (formattedStr) {
        const prevTableRows = initialTableRows.filter(
          (row) =>
            row.usr_full_nm.toLowerCase().includes(formattedStr) ||
            row.usr_id.toLowerCase().includes(formattedStr) ||
            row.usr_mail_id.toLowerCase().includes(formattedStr)
        );
        setTableRows([...prevTableRows]);
      } else {
        setTableRows([...initialTableRows]);
      }
      setInitialSearchStr(str);
      searchRef?.current?.childNodes[1]?.childNodes[1]?.focus();
    }, 1000),
    [initialTableRows]
  );

  const CustomButtonHeader = ({ toggleFilters }) => {
    const [searchStr, setSearchStr] = useState(initialSearchStr);
    const handleSearchChange = (e) => {
      setSearchStr(e.target.value);
      debounceFn(e.target.value);
    };
    return (
      <div>
        <Search
          ref={searchRef}
          placeholder="Search by name, email, or user ID"
          value={searchStr}
          onChange={(e) => handleSearchChange(e)}
          size="small"
          className="user-list-search-textbox"
        />
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
  };

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
      accessor: "formatted_emp_id",
      customCell: ProductsCell,
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("usr_id"),
      filterComponent: TextFieldFilter,
      width: "30%",
    },
    {
      header: "Status",
      accessor: "formatted_stat",
      customCell: StatusCell,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("formatted_stat"),
      filterComponent: createSelectFilterComponent(statusList, {
        size: "small",
        multiple: true,
      }),
      width: "10%",
    },
  ];

  const handleAddUser = () => {
    // dispatch(createUser());
    history.push("/user-management/add-user");
  };

  const Header = () => {
    return (
      <Paper>
        <div className="user-list-header">
          <Typography variant="h3">User Management</Typography>
          {canCreate && (
            <Button
              variant="primary"
              icon={<PlusIcon />}
              size="small"
              onClick={handleAddUser}
            >
              Add new user
            </Button>
          )}
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
    [tableRows, loading, initialSearchStr]
  );

  return (
    <div className="user-list-container-wrapper">
      <Header />
      <div className="user-list-table">
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
