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
// import IconButton from "apollo-react/components/IconButton";
import Typography from "apollo-react/components/Typography";
import Progress from "../../../components/Progress";

// import { MessageContext } from "../../../components/MessageProvider";

import { getPolicyList } from "../../../store/actions/PolicyAdminActions";

import {
  TextFieldFilter,
  createStringArraySearchFilter,
} from "../../../utils/index";

import "./PolicyList.scss";

const PolicyList = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [rowsPerPageRecord, setRowPerPageRecord] = useState(10);
  const [pageNo, setPageNo] = useState(0);
  const [sortedColumnValue, setSortedColumnValue] = useState("policyName");
  const [sortOrderValue, setSortOrderValue] = useState("asc");
  const [inlineFilters, setInlineFilters] = useState([]);
  const [open, setOpen] = useState(false);
  const [curRow, setCurRow] = useState({});
  const dispatch = useDispatch();
  const policyAdmin = useSelector((state) => state.policyAdmin);
  useEffect(() => {
    dispatch(getPolicyList());
  }, []);

  useEffect(() => {
    const { policyList, uniqueProducts } = policyAdmin;
    const uniquePolicies = Array.from(
      policyList
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
    setTableRows(uniquePolicies);
    setProducts(uniqueProducts);
    setLoading(false);
  }, [policyAdmin.loading]);

  // const messageContext = useContext(MessageContext);

  const goToPolicy = (e, id) => {
    e.preventDefault();
    history.push(`/policy-management/${id}`);
  };

  const LinkCell = ({ row, column: { accessor } }) => {
    const rowValue = row[accessor];
    const id = row.policyId;
    return (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <Link onClick={(e) => goToPolicy(e, id)}>{rowValue}</Link>
    );
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

  const DespCell = ({ row, column: { accessor } }) => {
    const data = row[accessor];
    const id = row.policyId;
    if (data.lenght() < 60) {
      return <>{data}</>;
    }
    return <div>{data}</div>;
  };

  const CustomButtonHeader = ({ toggleFilters }) => (
    <div>
      <Button
        size="small"
        variant="secondary"
        icon={PlusIcon}
        onClick={() => history.push("/launchpad")}
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
    },
    {
      header: "Policy Description",
      accessor: "policyDescription",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("policyDescription"),
      filterComponent: TextFieldFilter,
    },
    {
      header: "Products Included",
      accessor: "productsIncluded",
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("productsIncluded"),
      filterComponent: createSelectFilterComponent(products, {
        size: "small",
        multiple: true,
      }),
    },

    {
      header: "Status",
      accessor: "policyStatus",
      customCell: StatusCell,
    },
  ];

  const handleMouseOver = (row) => {
    setOpen(true);
    setCurRow(row);
  };

  const handleMouseOut = () => {
    setOpen(false);
  };

  const applyFilter = (cols, rows, filts) => {
    let filteredRows = rows;
    Object.values(cols).forEach((column) => {
      if (column.filterFunction) {
        filteredRows = filteredRows.filter((row) => {
          return column.filterFunction(row, filts);
        });
        if (column.sortFunction) {
          filteredRows.sort(
            column.sortFunction(sortedColumnValue, sortOrderValue)
          );
        }
      }
    });
    return filteredRows;
  };

  useEffect(() => {
    // const rows = applyFilter();
    // setTableRows([...rows]);
    console.log(inlineFilters, sortedColumnValue, sortOrderValue);
  }, [inlineFilters, sortedColumnValue, sortOrderValue]);

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
              sortedColumn={sortedColumnValue}
              sortOrder={sortOrderValue}
              page={pageNo}
              rowsPerPage={rowsPerPageRecord}
              onChange={(rpp, sc, so, filts, page) => {
                setRowPerPageRecord(rpp);
                setSortedColumnValue(sc);
                setSortOrderValue(so);
                setInlineFilters(filts);
                setPageNo(page);
                console.log("onChange", rpp, sc, so, filts, page);
              }}
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
              rowProps={{
                onMouseOver: handleMouseOver,
                onMouseOut: handleMouseOut,
              }}
            />
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
          </>
        )}
      </>
    ),
    [tableRows, loading, open]
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
      </div>
    </div>
  );
};

export default PolicyList;
