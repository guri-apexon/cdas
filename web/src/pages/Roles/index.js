/* eslint-disable jsx-a11y/anchor-is-valid */
import { Typography } from "@material-ui/core";
import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import Progress from "../../components/Progress";
import {
  TextFieldFilter,
  createStringArraySearchFilter,
  createStringArrayIncludedFilter,
} from "../../utils/index";
import "./index.scss";
import { fetchRoles } from "../../store/actions/RolesActions";

const ProductsCell = ({ row, column: { accessor } }) => {
  const rowValue = row[accessor];
  return <>{rowValue.slice(0, -1)}</>;
};

const statusList = ["Active", "Inactive"];

const Role = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [roleLists, setroleLists] = useState([]);
  const Roles = useSelector((state) => state.Roles);
  const [open, setOpen] = useState(false);
  const [curRow, setCurRow] = useState({});
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(fetchRoles());
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const { roles, uniqueProducts } = Roles;
    setTableRows(roles);
    setProducts(uniqueProducts);
    setLoading(false);
  }, [Roles.loading]);

  const goToRole = (e, id) => {
    e.preventDefault();
    history.push(`/role-management/${id}`);
  };

  const handleMouseOut = () => {
    setOpen(false);
  };

  const handleMouseOver = (row) => {
    setOpen(!open);
    setCurRow(row);
  };

  const handleInActivate = (e, id) => {
    e.preventDefault();
    const selectedData = tableRows.filter((d) => d.role_id === id);
    const unSelectedData = tableRows.filter((d) => d.role_id !== id);
    // selectedData[0].role_stat = "Inactive";
    setTableRows([...unSelectedData, ...selectedData]);
  };

  const handleActivate = (e, id) => {
    e.preventDefault();
    const selectedData = tableRows.filter((d) => d.role_id === id);
    const unSelectedData = tableRows.filter((d) => d.role_id !== id);
    // selectedData[0].role_stat = "Active";
    setTableRows([...unSelectedData, ...selectedData]);
  };

  const StatusCell = ({ row, column: { accessor } }) => {
    const data = row[accessor];
    const id = row.role_id;
    if (data === "active") {
      return (
        <Tooltip title="Active" disableFocusListener>
          <Switch
            checked={true}
            onChange={(e) => handleInActivate(e, id)}
            size="small"
          />
        </Tooltip>
      );
    }
    return (
      <Tooltip title="Inactive" disableFocusListener>
        <Switch
          checked={false}
          onChange={(e) => handleActivate(e, id)}
          size="small"
        />
      </Tooltip>
    );
  };

  const LinkCell = ({ row, column: { accessor } }) => {
    const rowValue = row[accessor];
    const id = row.role_id;
    if (rowValue.length > 30) {
      return (
        <Link
          onMouseOver={() => handleMouseOver(row)}
          onMouseOut={handleMouseOut}
          onClick={(e) => goToRole(e, id)}
        >
          {`${rowValue.slice(0, 30)}  [...]`}
        </Link>
      );
    }
    return <Link onClick={(e) => goToRole(e, id)}>{rowValue}</Link>;
  };

  const DespCell = ({ row, column: { accessor } }) => {
    const data = row[accessor];
    if (data.length < 80) {
      return <>{data}</>;
    }
    return (
      <>
        {data.slice(0, 50)}
        <Link
          onMouseOver={() => handleMouseOver(row)}
          onMouseOut={handleMouseOut}
        >
          {`  [...]`}
        </Link>
      </>
    );
  };

  const CustomButtonHeader = ({ toggleFilters }) => (
    <div>
      <Button
        size="small"
        variant="secondary"
        icon={PlusIcon}
        onClick={() => history.push("/create-role")}
        style={{ marginRight: "8px", border: "none" }}
      >
        Create new role
      </Button>
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
      accessor: "role_id",
      hidden: true,
    },
    {
      header: "Role Name",
      accessor: "role_nm",
      customCell: LinkCell,
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("role_nm"),
      filterComponent: TextFieldFilter,
      width: "20%",
    },
    {
      header: "Role Description",
      accessor: "role_desc",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("role_desc"),
      filterComponent: TextFieldFilter,
      customCell: DespCell,
      width: "40%",
    },
    {
      header: "Products Included",
      accessor: "products",
      customCell: ProductsCell,
      sortFunction: compareStrings,
      filterFunction: createStringArrayIncludedFilter("products"),
      filterComponent: createSelectFilterComponent(products, {
        size: "small",
        multiple: true,
      }),
      width: "30%",
    },
    {
      header: "Status",
      accessor: "role_stat",
      customCell: StatusCell,
      // sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("role_stat"),
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
          <Typography variant="h3">Role Management</Typography>
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
            title="Roles"
            columns={columns}
            rows={tableRows}
            rowId="role_id"
            hasScroll={true}
            maxHeight="calc(100vh - 162px)"
            // initialSortedColumn="role_nm"
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
        {tableRows.length > 0 ? renderTable : null}
      </div>
      <Peek
        open={open}
        followCursor
        placement="bottom"
        content={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <div style={{ maxWidth: 400 }}>
            <Typography
              variant="title2"
              gutterBottom
              style={{ fontWeight: 600 }}
            >
              {curRow.role_nm}
            </Typography>
            <Typography variant="body2">{curRow.role_desc}</Typography>
          </div>
        }
      />
    </div>
  );
};

export default Role;
