/* eslint-disable no-restricted-globals */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useContext, useEffect } from "react";
import {
  Link,
  Route,
  Switch,
  BrowserRouter as Router,
  useHistory,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import moment from "moment";
import * as XLSX from "xlsx";
import { pick } from "lodash";

import Table, {
  createSelectFilterComponent,
  createStringSearchFilter,
  dateFilterV2,
  numberSearchFilter,
  compareDates,
  compareNumbers,
  compareStrings,
} from "apollo-react/components/Table";
import Button from "apollo-react/components/Button";
import DownloadIcon from "apollo-react-icons/Download";
import FilterIcon from "apollo-react-icons/Filter";
import RefreshIcon from "apollo-react-icons/Refresh";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import IconButton from "apollo-react/components/IconButton";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import { ReactComponent as InProgressIcon } from "../../components/Icons/Icon_In-progress_72x72.svg";
import { ReactComponent as InFailureIcon } from "../../components/Icons/Icon_Failure_72x72.svg";
import Progress from "../../components/Progress";
import { MessageContext } from "../../components/Providers/MessageProvider";
import {
  createAutocompleteFilter,
  TextFieldFilter,
  IntegerFilter,
  DateFilter,
  createStringArraySearchFilter,
} from "../../utils/index";
import { updateSelectedStudy } from "../../store/actions/StudyBoardAction";

const columnsToAdd = [
  {
    header: "Therapeutic Area",
    accessor: "therapeuticarea",
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("therapeuticarea"),
    filterComponent: TextFieldFilter,
  },
  {
    header: "Project Code",
    accessor: "projectcode",
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("projectcode"),
    filterComponent: TextFieldFilter,
  },
];

const menuItems = [
  { text: "Study assignments" },
  { text: "Download study assignments" },
];

const ActionCell = ({ row }) => {
  return (
    <div style={{ display: "flex", justifyContent: "end" }}>
      <IconMenuButton size="small" menuItems={menuItems}>
        <EllipsisVertical />
      </IconMenuButton>
    </div>
  );
};

const DateCell = ({ row, column: { accessor } }) => {
  const rowValue = row[accessor];
  const date =
    rowValue && moment(rowValue).isSame(moment(), "day")
      ? moment(rowValue).format("DD-MMM-YYYY hh:mm A")
      : moment(rowValue).format("DD-MMM-YYYY");

  return <span>{date}</span>;
};

const obs = ["Failed", "Success", "In Progress"];

const obIcons = {
  Failed: InFailureIcon,
  "In Progress": InProgressIcon,
};

const SelectiveCell = ({ row, column: { accessor } }) => {
  const rowValue = row[accessor];
  const Img = obIcons[rowValue] || "noIcon";
  if (Img === "noIcon") {
    return (
      <div style={{ position: "relative", marginLeft: 25 }}>{rowValue}</div>
    );
  }
  return (
    <div style={{ position: "relative" }}>
      <Img
        style={{
          position: "relative",
          top: 5,
          marginRight: 5,
          width: 20,
          height: 20,
        }}
      />
      {rowValue}
    </div>
  );
};

export default function StudyTable({
  studyData,
  studyboardData,
  refreshData,
  selectedFilter,
}) {
  const [loading, setLoading] = useState(true);
  const [rowsPerPageRecord, setRowPerPageRecord] = useState(10);
  const [pageNo, setPageNo] = useState(0);
  const [sortedColumnValue, setSortedColumnValue] = useState("dateadded");
  const [sortOrderValue, setSortOrderValue] = useState("asc");
  const [inlineFilters, setInlineFilters] = useState([]);
  const messageContext = useContext(MessageContext);
  const dispatch = useDispatch();
  const history = useHistory();

  const status = studyData.uniqueProtocolStatus;

  const handleExisting = (row) => {
    history.push("/ExistingStudyAssignment");
    dispatch(updateSelectedStudy(row));
  };

  const LinkCell = ({ row, column: { accessor } }) => {
    const rowValue = row[accessor];
    return (
      <>
        <Link onClick={() => handleExisting(row)}>{rowValue}</Link>
      </>
    );
  };

  const CustomButtonHeader = ({ toggleFilters, rows, downloadFile }) => (
    <div>
      <Button
        size="small"
        variant="secondary"
        icon={DownloadIcon}
        onClick={downloadFile}
        style={{ marginRight: "8px", border: "none", boxShadow: "none" }}
      >
        Download
      </Button>
      <Button
        size="small"
        variant="secondary"
        icon={FilterIcon}
        onClick={toggleFilters}
        disabled={rows.length <= 0}
      >
        Filter
      </Button>
    </div>
  );

  const columns = [
    {
      header: "Protocol Number",
      accessor: "protocolnumber",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("protocolnumber"),
      filterComponent: TextFieldFilter,
    },
    {
      header: "Sponsor Name",
      accessor: "sponsorname",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("sponsorname"),
      filterComponent: TextFieldFilter,
    },
    {
      header: "Phase",
      accessor: "phase",
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("phase"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            studyboardData
              .map((r) => ({ label: r.phase }))
              .map((item) => item.label)
          )
        )
          .map((label) => {
            return { label };
          })
          .sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          })
      ),
    },
    {
      header: "Protocol Status",
      accessor: "protocolstatus",
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("protocolstatus"),
      filterComponent: createSelectFilterComponent(status, {
        size: "small",
        multiple: true,
      }),
    },
    {
      header: "Date Added",
      accessor: "dateadded",
      sortFunction: compareDates,
      customCell: DateCell,
      filterFunction: dateFilterV2("dateadded"),
      filterComponent: DateFilter,
    },
    {
      header: "Date Edited",
      accessor: "dateedited",
      sortFunction: compareDates,
      customCell: DateCell,
      filterFunction: dateFilterV2("dateedited"),
      filterComponent: DateFilter,
    },
    {
      header: "Onboarding Progress",
      accessor: "onboardingprogress",
      customCell: SelectiveCell,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("onboardingprogress"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            studyboardData
              .map((r) => ({ label: r.onboardingprogress }))
              .map((item) => item.label)
          )
        )
          .map((label) => {
            return { label };
          })
          .sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          })
      ),
    },
    {
      header: "Assignment Count",
      accessor: "assignmentcount",
      sortFunction: compareNumbers,
      customCell: LinkCell,
      filterFunction: numberSearchFilter("assignmentcount"),
      filterComponent: IntegerFilter,
    },
    {
      accessor: "action",
      customCell: ActionCell,
      width: 32,
    },
  ];

  const moreColumns = [
    ...columns.map((column) => ({ ...column })).slice(0, -1),
    ...columnsToAdd.map((column) => ({ ...column, hidden: true })),
    columns.slice(-1)[0],
  ];

  const [tableRows, setTableRows] = useState([...studyboardData]);
  const [exportTableRows, setExportTableRows] = useState([...studyboardData]);
  const [tableColumns, setTableColumns] = useState([...moreColumns]);

  useEffect(() => {
    if (!studyData.loading || studyData.studyboardFetchSuccess) {
      setLoading(false);
      setTableRows([...studyboardData]);
      setExportTableRows([...studyboardData]);
      setTableColumns([...moreColumns]);
    } else {
      setLoading(true);
    }
  }, [studyData.loading, studyboardData, studyData.studyboardFetchSuccess]);

  const exportToCSV = (exportData, headers, fileName) => {
    // console.log("data for export", exportData, headers, fileName);
    const wb = XLSX.utils.book_new();
    let ws = XLSX.worksheet;
    const from = pageNo * rowsPerPageRecord;
    const to = from + rowsPerPageRecord;
    const newData = exportData.slice(from, to);
    newData.unshift(headers);
    console.log("data", from, rowsPerPageRecord, newData);
    ws = XLSX.utils.json_to_sheet(newData, { skipHeader: true });
    XLSX.utils.book_append_sheet(wb, ws, "studylist");
    XLSX.writeFile(wb, fileName);
    exportData.shift();
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

  const exportDataRows = () => {
    const toBeExportRows = [...studyboardData];
    const sortedFilteredData = applyFilter(
      tableColumns,
      toBeExportRows,
      inlineFilters
    );
    setExportTableRows(sortedFilteredData);
    return sortedFilteredData;
  };

  const downloadFile = async (e) => {
    const fileExtension = ".xlsx";
    const fileName = `StudyList_${moment(new Date()).format("DDMMYYYY")}`;
    // console.log("inDown", exportHeader);
    const tempObj = {};
    const temp = tableColumns
      .slice(0, -1)
      .filter((d) => d.hidden !== true)
      .map((d) => {
        tempObj[d.accessor] = d.header;
        return d;
      });
    const newData = exportTableRows.map((obj) => {
      const newObj = pick(obj, Object.keys(tempObj));
      return newObj;
    });
    exportToCSV(newData, tempObj, fileName + fileExtension);
    const exportRows = exportDataRows();
    if (exportRows.length <= 0) {
      e.preventDefault();
      messageContext.showErrorMessage(
        `There is no data on the screen to download because of which an empty file has been downloaded.`,
        56
      );
    } else {
      messageContext.showSuccessMessage(`File downloaded successfully.`);
    }
  };

  useEffect(() => {
    const rows = exportDataRows();
    setTableRows([...rows]);
    setExportTableRows(rows);
  }, [inlineFilters, sortedColumnValue, sortOrderValue]);

  useEffect(() => {
    setTableColumns([...moreColumns]);
    setExportTableRows([...studyboardData]);
    setTableRows([...studyboardData]);
  }, []);

  const getTableData = React.useMemo(
    () => (
      <>
        {loading ? (
          <Progress />
        ) : (
          <>
            <Table
              isLoading={loading}
              title="Studies"
              subtitle={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <IconButton color="primary" onClick={refreshData}>
                  <RefreshIcon />
                </IconButton>
              }
              columns={tableColumns}
              rows={tableRows}
              rowId="protocolnumber"
              hasScroll={true}
              maxHeight="600px"
              initialSortedColumn="dateadded"
              initialSortOrder="asc"
              sortedColumn={sortedColumnValue}
              sortOrder={sortOrderValue}
              rowsPerPageOptions={[10, 50, 100, "All"]}
              tablePaginationProps={{
                labelDisplayedRows: ({ from, to, count }) =>
                  `${
                    count === 1 ? "Item " : "Items"
                  } ${from}-${to} of ${count}`,
                truncate: true,
              }}
              page={pageNo}
              rowsPerPage={rowsPerPageRecord}
              onChange={(rpp, sc, so, filts, page) => {
                setRowPerPageRecord(rpp);
                setSortedColumnValue(sc);
                setSortOrderValue(so);
                setInlineFilters(filts);
                setPageNo(page);
              }}
              columnSettings={{
                enabled: true,
                defaultColumns: moreColumns,
                onChange: (changeColumns) => {
                  setTableColumns(changeColumns);
                },
              }}
              CustomHeader={(props) => (
                <CustomButtonHeader
                  downloadFile={downloadFile}
                  rows={tableRows}
                  {...props}
                />
              )}
            />
          </>
        )}
      </>
    ),
    [tableColumns, tableRows, pageNo, rowsPerPageRecord, loading]
  );

  return <div className="study-table">{getTableData}</div>;
}
