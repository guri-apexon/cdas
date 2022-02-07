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

import { statusUpdate } from "../../../../services/ApiServices";
import { getVendorList } from "../../../../store/actions/VendorAdminAction";

import {
  TextFieldFilter,
  createStringArraySearchFilter,
  createStringArrayIncludedFilter,
} from "../../../../utils/index";

import "./VendorList.scss";

const ProductsCell = ({ row, column: { accessor } }) => {
  const rowValue = row[accessor];
  return <>{rowValue.slice(0, -1)}</>;
};

const statusList = ["Active", "Inactive"];
const vESNList = ["None", "CDR", "GDMPM-DAS", "IQB", "TDSE", "Wingspan"];

const VendorList = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [vendorLists, setVendorLists] = useState([]);
  // const [rowsPerPageRecord, setRowPerPageRecord] = useState(10);
  // const [pageNo, setPageNo] = useState(0);
  // const [sortedColumnValue, setSortedColumnValue] = useState("vendorName");
  // const [sortOrderValue, setSortOrderValue] = useState("asc");
  // const [inlineFilters, setInlineFilters] = useState([]);
  const [open, setOpen] = useState(false);
  const [curRow, setCurRow] = useState({});
  const dispatch = useDispatch();
  const vendorAdmin = useSelector((state) => state.vendorAdmin);

  const getData = () => {
    dispatch(getVendorList());
  };

  const createUniqueData = (arrayList) => {
    const uniqueList = Array.from(
      arrayList
        .reduce((acc, { vContactName, vId, ...r }) => {
          const current = acc.get(vId) || {
            ...r,
            vId,
            contactsJoined: "",
          };
          return acc.set(vId, {
            ...current,
            contactsJoined: `${current.contactsJoined} ${vContactName},`,
          });
        }, new Map())
        .values()
    );
    return uniqueList;
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const { vendorList } = vendorAdmin;
    setVendorLists(vendorList);
    setLoading(false);
  }, [vendorAdmin.loading]);

  useEffect(() => {
    const uniqueList = createUniqueData(vendorLists);
    setTableRows(uniqueList);
  }, [vendorLists]);

  // const messageContext = useContext(MessageContext);

  const goToVendor = (e, id) => {
    e.preventDefault();
    history.push(`/vendor/edit/${id}`);
  };

  const handleInActivate = async (e, id) => {
    e.preventDefault();
    const update = await statusUpdate(id, 0);
    if (update) {
      const selectedData = tableRows.filter((d) => d.vId === id);
      const unSelectedData = tableRows.filter((d) => d.vId !== id);
      selectedData[0].vStatus = "Inactive";
      setTableRows([...unSelectedData, ...selectedData]);
    }
    // console.log("tableRows", tableRows, products, id);
  };

  const handleActivate = async (e, id) => {
    e.preventDefault();
    const update = await statusUpdate(id, 1);
    if (update) {
      const selectedData = tableRows.filter((d) => d.vId === id);
      const unSelectedData = tableRows.filter((d) => d.vId !== id);
      selectedData[0].vStatus = "Active";
      setTableRows([...unSelectedData, ...selectedData]);
    }
    // console.log("tableRows", tableRows, products, id);
  };

  const StatusCell = ({ row, column: { accessor } }) => {
    const data = row[accessor];
    const id = row.vId;
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
    const id = row.vId;
    if (rowValue.length > 30) {
      return (
        <Link
          onMouseOver={() => handleMouseOver(row)}
          onMouseOut={handleMouseOut}
          onClick={(e) => goToVendor(e, id)}
        >
          {`${rowValue.slice(0, 30)}  [...]`}
        </Link>
      );
    }
    return <Link onClick={(e) => goToVendor(e, id)}>{rowValue}</Link>;
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
        onClick={() => history.push("/vendor/create")}
        style={{ marginRight: "8px", border: "none" }}
      >
        Add vendor
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
      accessor: "vId",
      hidden: true,
    },
    {
      header: "Vendor Name",
      accessor: "vName",
      customCell: LinkCell,
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("vName"),
      filterComponent: TextFieldFilter,
      width: "20%",
    },
    {
      header: "Vendor Description",
      accessor: "vDescription",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("vDescription"),
      filterComponent: TextFieldFilter,
      customCell: DespCell,
      width: "25%",
    },
    {
      header: "Contact Names",
      accessor: "contactsJoined",
      customCell: ProductsCell,
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("contactsJoined"),
      filterComponent: TextFieldFilter,
      width: "30%",
    },
    {
      header: "External System",
      accessor: "vESN",
      customCell: ProductsCell,
      sortFunction: compareStrings,
      filterFunction: createStringArrayIncludedFilter("vESN"),
      filterComponent: createSelectFilterComponent(vESNList, {
        size: "small",
        multiple: true,
      }),
      width: "15%",
    },
    {
      header: "Status",
      accessor: "vStatus",
      customCell: StatusCell,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("vStatus"),
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
  //   const rows = applyFilter(newColumns, vendorLists, inlineFilters);
  //   const uniqueRows = createUniqueData(rows);
  //   console.log("filtered", rows, uniqueRows);
  //   setTableRows([...uniqueRows]);
  // }, [inlineFilters, sortedColumnValue, sortOrderValue]);

  // const getTableData = React.useMemo(
  //   () => (
  //     <>
  //       {loading ? (
  //         <Progress />
  //       ) : (
  //         <>
  //           <Table
  //             isLoading={loading}
  //             title="Policies"
  //             columns={columns}
  //             rows={tableRows}
  //             rowId="vId"
  //             hasScroll={true}
  //             maxHeight="calc(100vh - 162px)"
  //             initialSortedColumn="vendorName"
  //             initialSortOrder="asc"
  //             // sortedColumn={sortedColumnValue}
  //             // sortOrder={sortOrderValue}
  //             // page={pageNo}
  //             // rowsPerPage={rowsPerPageRecord}
  //             // onChange={(rpp, sc, so, filts, page) => {
  //             //   setRowPerPageRecord(rpp);
  //             //   setSortedColumnValue(sc);
  //             //   setSortOrderValue(so);
  //             //   setInlineFilters(filts);
  //             //   setPageNo(page);
  //             //   // console.log("onChange", rpp, sc, so, filts, page);
  //             // }}
  //             rowsPerPageOptions={[10, 50, 100, "All"]}
  //             tablePaginationProps={{
  //               labelDisplayedRows: ({ from, to, count }) =>
  //                 `${
  //                   count === 1 ? "Item " : "Items"
  //                 } ${from}-${to} of ${count}`,
  //               truncate: true,
  //             }}
  //             showFilterIcon
  //             CustomHeader={(props) => <CustomButtonHeader {...props} />}
  //           />
  //         </>
  //       )}
  //     </>
  //   ),
  //   [tableRows, loading]
  // );

  return (
    <div className="vendor-list-wrapper">
      <div className="page-header">
        <Typography variant="h2" gutterBottom>
          Vendor Admin
        </Typography>
      </div>
      <div className="vendor-table">
        <div className="table">
          {/* {getTableData} */}
          {loading ? (
            <Progress />
          ) : (
            <Table
              isLoading={loading}
              title="Policies"
              columns={columns}
              rows={tableRows}
              rowId="vId"
              hasScroll={true}
              maxHeight="calc(100vh - 162px)"
              initialSortedColumn="vName"
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
          )}
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
                {curRow.vendorName}
              </Typography>
              <Typography variant="body2">
                {curRow.vendorDescription}
              </Typography>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default VendorList;
