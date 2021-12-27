import React, { useRef, useState, useContext, useEffect } from "react";
import moment from "moment";
import { CSVLink } from "react-csv";

import Table, {
  createSelectFilterComponent,
  createStringSearchFilter,
  dateFilterV2,
  numberSearchFilter,
} from "apollo-react/components/Table";
import Button from "apollo-react/components/Button";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import DateRangePickerV2 from "apollo-react/components/DateRangePickerV2";
import DownloadIcon from "apollo-react-icons/Download";
import FilterIcon from "apollo-react-icons/Filter";
import RefreshIcon from "apollo-react-icons/Refresh";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import Link from "apollo-react/components/Link";
import IconButton from "apollo-react/components/IconButton";
import { TextField } from "apollo-react/components/TextField/TextField";
import {
  compareDates,
  compareNumbers,
  compareStrings,
} from "../../utils/index";
import { ReactComponent as InProgressIcon } from "./Icon_In-progress_72x72.svg";
import { ReactComponent as InFailureIcon } from "./Icon_Failure_72x72.svg";
import Progress from "../../components/Progress";
import { MessageContext } from "../../components/MessageProvider";

const createAutocompleteFilter =
  (source) =>
  ({ accessor, filters, updateFilterValue }) => {
    const ref = React.useRef();
    const [height, setHeight] = React.useState(0);
    const [isFocused, setIsFocused] = React.useState(false);
    const value = filters[accessor];

    React.useEffect(() => {
      const curHeight = ref?.current?.getBoundingClientRect().height;
      if (curHeight !== height) {
        setHeight(curHeight);
      }
    }, [value, isFocused, height]);

    return (
      <div
        style={{
          minWidth: 160,
          maxWidth: 200,
          position: "relative",
          height,
        }}
      >
        <AutocompleteV2
          style={{ position: "absolute", left: 0, right: 0 }}
          value={
            value
              ? value.map((label) => {
                  if (label === "") {
                    return { label: "blanks" };
                  }
                  return { label };
                })
              : []
          }
          name={accessor}
          source={source}
          onChange={(event, value2) => {
            updateFilterValue({
              target: {
                name: accessor,
                value: value2.map(({ label }) => {
                  if (label === "blanks") {
                    return "";
                  }
                  return label;
                }),
              },
            });
          }}
          fullWidth
          multiple
          chipColor="white"
          size="small"
          forcePopupIcon
          showCheckboxes
          limitChips={1}
          filterSelectedOptions={false}
          blurOnSelect={false}
          clearOnBlur={false}
          disableCloseOnSelect
          matchFrom="any"
          showSelectAll
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          ref={ref}
          noOptionsText="No matches"
        />
      </div>
    );
  };

const TextFieldFilter = ({ accessor, filters, updateFilterValue }) => {
  // console.log("studyData temp", studyData, accessor, filters);
  return (
    <TextField
      value={filters[accessor]}
      name={accessor}
      onChange={updateFilterValue}
      fullWidth
      margin="none"
      size="small"
    />
  );
};

const IntegerFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <TextField
      value={filters[accessor]}
      name={accessor}
      onChange={updateFilterValue}
      type="number"
      style={{ width: 74 }}
      margin="none"
      size="small"
    />
  );
};

const DateFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <div style={{ minWidth: 230 }}>
      <div style={{ position: "absolute", top: 0, paddingRight: 4 }}>
        <DateRangePickerV2
          value={filters[accessor] || [null, null]}
          name={accessor}
          onChange={(value) =>
            updateFilterValue({
              target: { name: accessor, value },
            })
          }
          startLabel=""
          endLabel=""
          placeholder=""
          fullWidth
          margin="none"
          size="small"
        />
      </div>
    </div>
  );
};

const createStringArraySearchFilter = (accessor) => {
  return (row, filters) =>
    !Array.isArray(filters[accessor]) ||
    filters[accessor].length === 0 ||
    filters[accessor].some(
      (value) => value.toUpperCase() === row[accessor]?.toUpperCase()
    );
};

export default function StudyTable({ studyData, refreshData, selectedFilter }) {
  const [loading, setLoading] = useState(true);
  // const [filters, setFilters] = useState([]);
  const [exportHeader, setExportHeader] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [exportTableRows, setExportTableRows] = useState([]);
  const [sortedColumnValue, setSortedColumnValue] = useState("requestDate");
  const [rowsPerPageRecord, setRowPerPageRecord] = useState(10);
  const [pageNo, setPageNo] = useState(0);
  const [sortOrderValue, setSortOrderValue] = useState("desc");
  const [inlineFilters, setInlineFilters] = useState([]);

  const messageContext = useContext(MessageContext);

  const studyboardData = selectedFilter
    ? studyData?.studyboardData.filter(
        (data) => data.onboardingprogress === selectedFilter
      )
    : studyData.studyboardData;

  useEffect(() => {
    if (studyData.loading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [studyData]);

  const downloadElementRef = useRef();

  const obs = ["Failed", "Success", "In Progress"];

  const phases = studyData.uniqurePhase;

  const status = studyData.uniqueProtocolStatus;

  const obIcons = {
    Failed: InFailureIcon,
    "In Progress": InProgressIcon,
  };

  const LinkCell = ({ row, column: { accessor } }) => {
    const rowValue = row[accessor];
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    return (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <Link onClick={() => console.log(`link clicked ${rowValue}`)}>
        {rowValue}
      </Link>
    );
  };

  const DateCell = ({ row, column: { accessor } }) => {
    const rowValue = row[accessor];
    const date =
      rowValue && moment(rowValue, "DD-MMM-YYYY").isValid()
        ? moment(rowValue).format("DD-MMM-YYYY")
        : moment(rowValue).format("DD-MMM-YYYY");

    return <span>{date}</span>;
  };

  const ActionCell = ({ row }) => {
    return (
      <div style={{ display: "flex", justifyContent: "end" }}>
        <IconButton size="small" data-id={row.protocolnumber}>
          <EllipsisVertical />
        </IconButton>
      </div>
    );
  };

  const SelectiveCell = ({ row, column: { accessor } }) => {
    const onboardingprogress = row[accessor];
    const Img = obIcons[onboardingprogress] || "noIcon";
    if (Img === "noIcon") {
      return (
        <div style={{ position: "relative", marginLeft: 25 }}>
          {onboardingprogress}
        </div>
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
        {onboardingprogress}
      </div>
    );
  };

  const CustomButtonHeader = ({ toggleFilters, downloadFile }) => (
    <div>
      <Button
        size="small"
        variant="secondary"
        icon={DownloadIcon}
        onClick={downloadFile}
        style={{ marginRight: "8px", border: "none" }}
      >
        Download
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
      filterComponent: createSelectFilterComponent(phases, {
        size: "small",
        multiple: true,
      }),
      // filterComponent: createAutocompleteFilter(
      //   Array.from(
      //     new Set(
      //       studyboardData
      //         .filter(({ phase }) => phase)
      //         .map(({ phase }) => ({ label: phase }))
      //         .map((item) => item.label)
      //     )
      //   )
      //     .map((label) => {
      //       return { label };
      //     })
      //     .sort((a, b) => {
      //       if (a.label < b.label) {
      //         return -1;
      //       }
      //       if (a.label > b.label) {
      //         return 1;
      //       }
      //       return 0;
      //     })
      // ),
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

  const moreColumns = [
    ...columns.map((column) => ({ ...column })).slice(0, -1),
    ...columnsToAdd.map((column) => ({ ...column, hidden: true })),
    columns.slice(-1)[0],
  ];

  useEffect(() => {
    setTableColumns([...moreColumns]);
    setExportTableRows(studyboardData);
    const updatedColumns = columns.map((column) => {
      if (column.accessor === "actions") {
        return column;
      }
      const filterColumn = {
        ...column,
        filterFunction: createStringArraySearchFilter(column.accessor),
        filterComponent: createAutocompleteFilter(
          Array.from(
            new Set(
              studyboardData
                .map((r) => ({ label: r[column.accessor] }))
                .map((item) => item.label)
            )
          )
            .sort()
            .map((label) => {
              return { label };
            })
        ),
      };
      return filterColumn;
    });
    setTableColumns(updatedColumns);
  }, []);

  useEffect(() => {
    const newHeader = tableColumns
      .filter((e) => e.hidden !== true)
      .map((e) => {
        const newObj = { label: e.header, key: e.accessor };
        return newObj;
      });
    setExportHeader([...newHeader]);
    // console.log("columns", tableColumns, newHeader);
  }, [tableColumns]);

  const applyFilter = (cols, records, filts) => {
    let filteredRows = records;
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

  useEffect(() => {
    const rows = exportDataRows();
    setExportTableRows(rows);
  }, [inlineFilters, sortedColumnValue]);

  const downloadFile = (e) => {
    downloadElementRef.current.link.click();
    const exportRows = exportDataRows();
    if (exportRows.length <= 0) {
      e.preventDefault();
      const message = `There is no data on the screen to download because of which an empty file has been downloaded.`;
      messageContext.showErrorMessage(message);
    } else {
      const message = `File downloaded successfully.`;
      messageContext.showSuccessMessage(message);
    }
    // return false;
  };

  const getTableData = React.useMemo(
    () => (
      <>
        {console.log("headers", exportHeader)}
        {loading ? (
          <Progress />
        ) : (
          <>
            <CSVLink
              data={exportTableRows}
              headers={exportHeader}
              filename={`StudyList_${moment(new Date()).format(
                "YYYYMMDD"
              )}.csv`}
              target="Visits"
              style={{ textDecoration: "none", display: "none" }}
              ref={downloadElementRef}
            >
              download
            </CSVLink>
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
              rows={studyboardData}
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
                <CustomButtonHeader downloadFile={downloadFile} {...props} />
              )}
            />
          </>
        )}
      </>
    ),
    [moreColumns, studyboardData]
  );

  return <div className="study-table">{getTableData}</div>;
}
