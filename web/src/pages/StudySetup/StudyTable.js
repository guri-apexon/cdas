/* eslint-disable no-restricted-globals */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useContext, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
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
  TextFieldFilter,
  IntegerFilter,
  DateFilter,
  createStringArrayIncludedFilter,
} from "../../utils/index";
import { updateSelectedStudy } from "../../store/actions/StudyBoardAction";

const menuItems = [
  { text: "Study assignments" },
  { text: "Download study assignments" },
];

const ActionCell = ({ row }) => {
  return (
    <div style={{ display: "flex", justifyContent: "end" }}>
      <IconMenuButton size="small" id="action" menuItems={menuItems}>
        <EllipsisVertical />
      </IconMenuButton>
    </div>
  );
};

const DateCell = ({ row, column: { accessor } }) => {
  const rowValue = row[accessor];
  const date = rowValue ? moment(rowValue).format("DD-MMM-YYYY") : "";
  // rowValue && moment(rowValue).isSame(moment(), "day")
  //   ? moment(rowValue).format("DD-MMM-YYYY hh:mm A")
  //   : moment(rowValue).format("DD-MMM-YYYY");

  return <span>{date}</span>;
};

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

export default function StudyTable({ studyData, studyboardData, refreshData }) {
  const [loading, setLoading] = useState(true);
  const [rowsPerPageRecord, setRowPerPageRecord] = useState(10);
  const [pageNo, setPageNo] = useState(0);
  const [sortedColumnValue, setSortedColumnValue] = useState("dateadded");
  const [sortOrderValue, setSortOrderValue] = useState("desc");
  const [inlineFilters, setInlineFilters] = useState([]);
  const messageContext = useContext(MessageContext);
  const dispatch = useDispatch();
  const history = useHistory();
  const status = studyData.uniqueProtocolStatus;
  const thbtcArea = studyData.uniqueThbtcArea;
  const obs = studyData.uniqueObs;
  const phases = studyData.uniquePhase;
  const handleExisting = (row) => {
    history.push("/ExistingStudyAssignment");
    dispatch(updateSelectedStudy(row));
  };
  const LinkCell = ({ row, column: { accessor } }) => {
    const rowValue = row[accessor];
    return (
      <>
        <Link to="#" onClick={() => handleExisting(row)}>
          {rowValue}
        </Link>
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
  const columnsToAdd = [
    {
      header: "Therapeutic Area",
      accessor: "therapeuticarea",
      sortFunction: compareStrings,
      filterFunction: createStringArrayIncludedFilter("therapeuticarea"),
      filterComponent: createSelectFilterComponent(thbtcArea, {
        size: "small",
        multiple: true,
      }),
    },
    {
      header: "Project Code",
      accessor: "projectcode",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("projectcode"),
      filterComponent: TextFieldFilter,
    },
  ];
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
      filterFunction: createStringArrayIncludedFilter("phase"),
      filterComponent: createSelectFilterComponent(phases, {
        size: "small",
        multiple: true,
      }),

      // filterFunction: createStringArrayIncludedFilter("phase"),
      // filterComponent: createFilterList(phases),
    },
    {
      header: "Protocol Status",
      accessor: "protocolstatus",
      sortFunction: compareStrings,
      // filterFunction: createStringArrayIncludedFilter("protocolstatus"),
      // filterComponent: createFilterList(status),
      // filterFunction: createStringSearchFilter("protocolstatus"),
      // filterComponent: TextFieldFilter,
      filterFunction: createStringArrayIncludedFilter("protocolstatus"),
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
      // filterFunction: createStringArrayIncludedFilter("onboardingprogress"),
      // filterComponent: createFilterList(obs),
      // filterFunction: createStringSearchFilter("onboardingprogress"),
      // filterComponent: TextFieldFilter,
      filterFunction: createStringArrayIncludedFilter("onboardingprogress"),
      filterComponent: createSelectFilterComponent(obs, {
        size: "small",
        multiple: true,
      }),
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
    const wb = XLSX.utils.book_new();
    let ws = XLSX.worksheet;
    let from = pageNo * rowsPerPageRecord;
    let to = from + rowsPerPageRecord;
    if (rowsPerPageRecord === "All") {
      from = 0;
      to = exportData.length;
    }
    const newData = exportData.slice(from, to);
    newData.unshift(headers);
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
          initialSortOrder="desc"
          sortedColumn={sortedColumnValue}
          sortOrder={sortOrderValue}
          rowsPerPageOptions={[10, 50, 100, "All"]}
          tablePaginationProps={{
            labelDisplayedRows: ({ from, to, count }) =>
              `${count === 1 ? "Item " : "Items"} ${from}-${to} of ${count}`,
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
    ),
    [
      tableColumns,
      tableRows,
      pageNo,
      rowsPerPageRecord,
      loading,
      sortOrderValue,
      sortedColumnValue,
      inlineFilters,
    ]
  );

  return (
    <div className="study-table">
      {loading && <Progress />}
      {!loading && getTableData}
    </div>
  );
}
