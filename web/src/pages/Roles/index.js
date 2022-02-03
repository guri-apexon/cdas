import { Typography } from "@material-ui/core";
import React, { useMemo, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
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
  const [open, setOpen] = useState(false);
  const [curRow, setCurRow] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    const Roles = [
      {
        roleID: 1,
        roleName: "Data Strategist",
        roleDescription: "abc",
        productsIncluded: "admin, mapping",
        roleStatus: "active",
      },
      {
        roleID: 2,
        roleName: "Sponsor",
        roleDescription: "xyz",
        productsIncluded: "ingestion, mapping",
        roleStatus: "Inactive",
      },
      {
        roleID: 3,
        roleName: "Data Reviewer",
        roleDescription: "lmn",
        productsIncluded: "ingestion, review",
        roleStatus: "active",
      },
      {
        roleID: 4,
        roleName: "Data Monitor",
        roleDescription: "pqr",
        productsIncluded: "admin, review",
        roleStatus: "Inactive",
      },
    ];
    setTableRows(Roles);
    setLoading(false);
  }, []);

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
    const selectedData = tableRows.filter((d) => d.roleID === id);
    const unSelectedData = tableRows.filter((d) => d.roleID !== id);
    selectedData[0].roleStatus = "Inactive";
    setTableRows([...unSelectedData, ...selectedData]);
    // console.log("tableRows", tableRows, products, id);
  };

  const handleActivate = (e, id) => {
    e.preventDefault();
    const selectedData = tableRows.filter((d) => d.roleID === id);
    const unSelectedData = tableRows.filter((d) => d.roleID !== id);
    selectedData[0].roleStatus = "Active";
    setTableRows([...unSelectedData, ...selectedData]);
    // console.log("tableRows", tableRows, products, id);
  };

  const StatusCell = ({ row, column: { accessor } }) => {
    const data = row[accessor];
    const id = row.roleID;
    if (data === "Active") {
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

  //   const LinkCell = ({ row, column: { accessor } }) => {
  //     const rowValue = row[accessor];
  //     const id = row.roleID;
  //     if (rowValue.length > 30) {
  //       return (
  //         <Link
  //           onMouseOver={() => handleMouseOver(row)}
  //           onMouseOut={handleMouseOut}
  //           onClick={(e) => goToRole(e, id)}
  //         >
  //           {`${rowValue.slice(0, 30)}  [...]`}
  //         </Link>
  //       );
  //     }
  //     return <Link onClick={(e) => goToRole(e, id)}>{rowValue}</Link>;
  //   };

  //   const DespCell = ({ row, column: { accessor } }) => {
  //     const data = row[accessor];
  //     if (data.length < 80) {
  //       return <>{data}</>;
  //     }
  //     return (
  //       <>
  //         {data.slice(0, 50)}
  //         <Link
  //           onMouseOver={() => handleMouseOver(row)}
  //           onMouseOut={handleMouseOut}
  //         >
  //           {`  [...]`}
  //         </Link>
  //       </>
  //     );
  //   };

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
      accessor: "roleID",
      hidden: true,
    },
    {
      header: "Role Name",
      accessor: "roleName",
      //   customCell: LinkCell,
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("roleName"),
      filterComponent: TextFieldFilter,
      width: "20%",
    },
    {
      header: "Role Description",
      accessor: "roleDescription",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("roleDescription"),
      filterComponent: TextFieldFilter,
      //   customCell: DespCell,
      width: "40%",
    },
    {
      header: "Products Included",
      accessor: "productsIncluded",
      customCell: ProductsCell,
      sortFunction: compareStrings,
      filterFunction: createStringArrayIncludedFilter("productsIncluded"),
      filterComponent: createSelectFilterComponent(products, {
        size: "small",
        multiple: true,
      }),
      width: "30%",
    },
    {
      header: "Status",
      accessor: "roleStatus",
      customCell: StatusCell,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("roleStatus"),
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

  const getTableData = useMemo(
    () => (
      <>
        <Table
          isLoading={loading}
          title="Roles"
          columns={columns}
          rows={tableRows}
          rowId="roleID"
          hasScroll={true}
          maxHeight="calc(100vh - 162px)"
          initialSortedColumn="roleName"
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
      </>
    ),
    [tableRows, loading]
  );

  return (
    <div>
      <Header />
      <div className="roles-table">{getTableData}</div>
    </div>
  );
};

export default Role;
