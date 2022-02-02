/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import Tooltip from "apollo-react/components/Tooltip";
import { useHistory } from "react-router-dom";
import Switch from "apollo-react/components/Switch";
import Typography from "apollo-react/components/Typography";
import Progress from "../../../../components/Progress";

// import { MessageContext } from "../../../components/MessageProvider";

import { getPolicyList } from "../../../../store/actions/PolicyAdminActions";

import {
  TextFieldFilter,
  createStringArraySearchFilter,
  createStringArrayIncludedFilter,
} from "../../../../utils/index";

import "./PolicyList.scss";

const ProductsCell = ({ row, column: { accessor } }) => {
  const rowValue = row[accessor];
  return <>{rowValue.slice(0, -1)}</>;
};

const statusList = ["Active", "Inactive"];

const PolicyList = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [policyLists, setPolicyLists] = useState([]);
  // const [rowsPerPageRecord, setRowPerPageRecord] = useState(10);
  // const [pageNo, setPageNo] = useState(0);
  // const [sortedColumnValue, setSortedColumnValue] = useState("policyName");
  // const [sortOrderValue, setSortOrderValue] = useState("asc");
  // const [inlineFilters, setInlineFilters] = useState([]);
  const [open, setOpen] = useState(false);
  const [curRow, setCurRow] = useState({});
  const dispatch = useDispatch();
  const policyAdmin = useSelector((state) => state.policyAdmin);

  const getData = () => {
    dispatch(getPolicyList());
  };

  const createUniqueData = (arrayList) => {
    const uniquePolicies = Array.from(
      arrayList
        .reduce((acc, { productName, policyId, ...r }) => {
          const current = acc.get(policyId) || {
            ...r,
            policyId,
            productsIncluded: "",
          };
          return acc.set(policyId, {
            ...current,
            productsIncluded: `${current.productsIncluded} ${productName},`,
          });
        }, new Map())
        .values()
    );
    return uniquePolicies;
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const { policyList, uniqueProducts } = policyAdmin;
    setPolicyLists(policyList);
    setProducts(uniqueProducts);
    setLoading(false);
  }, [policyAdmin.loading]);

  useEffect(() => {
    const uniquePolicies = createUniqueData(policyLists);
    setTableRows(uniquePolicies);
  }, [policyLists]);

  // const messageContext = useContext(MessageContext);

  const goToPolicy = (e, id) => {
    e.preventDefault();
    history.push(`/policy-management/${id}`);
  };

  const handleInActivate = (e, id) => {
    e.preventDefault();
    const selectedData = tableRows.filter((d) => d.policyId === id);
    const unSelectedData = tableRows.filter((d) => d.policyId !== id);
    selectedData[0].policyStatus = "Inactive";
    setTableRows([...unSelectedData, ...selectedData]);
    // console.log("tableRows", tableRows, products, id);
  };

  const handleActivate = (e, id) => {
    e.preventDefault();
    const selectedData = tableRows.filter((d) => d.policyId === id);
    const unSelectedData = tableRows.filter((d) => d.policyId !== id);
    selectedData[0].policyStatus = "Active";
    setTableRows([...unSelectedData, ...selectedData]);
    // console.log("tableRows", tableRows, products, id);
  };

  const StatusCell = ({ row, column: { accessor } }) => {
    const data = row[accessor];
    const id = row.policyId;
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

  const handleMouseOver = (row) => {
    setOpen(!open);
    setCurRow(row);
  };

  const handleMouseOut = () => {
    setOpen(false);
  };

  const LinkCell = ({ row, column: { accessor } }) => {
    const rowValue = row[accessor];
    const id = row.policyId;
    if (rowValue.length > 30) {
      return (
        <Link
          onMouseOver={() => handleMouseOver(row)}
          onMouseOut={handleMouseOut}
          onClick={(e) => goToPolicy(e, id)}
        >
          {`${rowValue.slice(0, 30)}  [...]`}
        </Link>
      );
    }
    return <Link onClick={(e) => goToPolicy(e, id)}>{rowValue}</Link>;
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
        onClick={() => history.push("/create-policy")}
        style={{ marginRight: "8px", border: "none" }}
      >
        Create new policy
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
      accessor: "policyId",
      hidden: true,
    },
    {
      header: "Policy Name",
      accessor: "policyName",
      customCell: LinkCell,
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("policyName"),
      filterComponent: TextFieldFilter,
      width: "20%",
    },
    {
      header: "Policy Description",
      accessor: "policyDescription",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("policyDescription"),
      filterComponent: TextFieldFilter,
      customCell: DespCell,
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
      accessor: "policyStatus",
      customCell: StatusCell,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("policyStatus"),
      filterComponent: createSelectFilterComponent(statusList, {
        size: "small",
        multiple: true,
      }),
      width: "10%",
    },
  ];

  // const newColumns = [
  //   columns[0],
  //   columns[1],
  //   columns[2],
  //   {
  //     header: "Products Included",
  //     accessor: "productName",
  //     customCell: ProductsCell,
  //     sortFunction: compareStrings,
  //     filterFunction: createStringArraySearchFilter("productName"),
  //     filterComponent: createSelectFilterComponent(products, {
  //       size: "small",
  //       multiple: true,
  //     }),
  //   },
  //   columns[4],
  // ];

  // const applyFilter = (cols, rows, filts) => {
  //   let filteredRows = rows;
  //   console.log("productsIncluded", cols);
  //   Object.values(cols).forEach((column) => {
  //     if (column.filterFunction) {
  //       filteredRows = filteredRows.filter((row) => {
  //         return column.filterFunction(row, filts);
  //       });
  //       if (column.sortFunction) {
  //         filteredRows.sort(
  //           column.sortFunction(sortedColumnValue, sortOrderValue)
  //         );
  //       }
  //     }
  //   });
  //   // console.log("try", Object.values(cols));
  //   return filteredRows;
  // };

  // useEffect(() => {
  //   const rows = applyFilter(newColumns, policyLists, inlineFilters);
  //   const uniqueRows = createUniqueData(rows);
  //   console.log("filtered", rows, uniqueRows);
  //   setTableRows([...uniqueRows]);
  // }, [inlineFilters, sortedColumnValue, sortOrderValue]);

  const getTableData = React.useMemo(
    () => (
      <>
        {loading ? (
          <Progress />
        ) : (
          <>
            <Table
              isLoading={loading}
              title="Policies"
              columns={columns}
              rows={tableRows}
              rowId="policyId"
              hasScroll={true}
              maxHeight="calc(100vh - 162px)"
              initialSortedColumn="policyName"
              initialSortOrder="asc"
              // sortedColumn={sortedColumnValue}
              // sortOrder={sortOrderValue}
              // page={pageNo}
              // rowsPerPage={rowsPerPageRecord}
              // onChange={(rpp, sc, so, filts, page) => {
              //   setRowPerPageRecord(rpp);
              //   setSortedColumnValue(sc);
              //   setSortOrderValue(so);
              //   setInlineFilters(filts);
              //   setPageNo(page);
              //   // console.log("onChange", rpp, sc, so, filts, page);
              // }}
              rowsPerPageOptions={[10, 50, 100, "All"]}
              tablePaginationProps={{
                labelDisplayedRows: ({ from, to, count }) =>
                  `${
                    count === 1 ? "Item " : "Items"
                  } ${from}-${to} of ${count}`,
                truncate: true,
              }}
              showFilterIcon
              CustomHeader={(props) => <CustomButtonHeader {...props} />}
            />
          </>
        )}
      </>
    ),
    [tableRows, loading]
  );

  return (
    <div className="policy-list-wrapper">
      <div className="page-header">
        <Typography variant="h2" gutterBottom>
          Policy Management
        </Typography>
      </div>
      <div className="policy-table">
        <div className="table">{getTableData}</div>
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
                {curRow.policyName}
              </Typography>
              <Typography variant="body2">
                {curRow.policyDescription}
              </Typography>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default PolicyList;
