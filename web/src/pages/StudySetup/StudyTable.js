import React, { useRef, useState } from "react";
import moment from "moment";
import { CSVLink } from "react-csv";

import Table, {
  compareDates,
  compareNumbers,
  compareStrings,
  createSelectFilterComponent,
  createStringSearchFilter,
  dateFilterV2,
  numberSearchFilter,
} from "apollo-react/components/Table";
import Button from "apollo-react/components/Button";
// import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import DateRangePickerV2 from "apollo-react/components/DateRangePickerV2";
import DownloadIcon from "apollo-react-icons/Download";
import FilterIcon from "apollo-react-icons/Filter";
import RefreshIcon from "apollo-react-icons/Refresh";
import IconButton from "apollo-react/components/IconButton";
import { TextField } from "apollo-react/components/TextField/TextField";
import { ReactComponent as InProgressIcon } from "./Icon_In-progress_72x72.svg";
import { ReactComponent as InFailureIcon } from "./Icon_Failure_72x72.svg";

export default function StudyTable({ studyData, refreshData, selectedFilter }) {
  const studyboardData = selectedFilter
    ? studyData?.studyboardData.filter(
        (data) => data.onboardingprogress === selectedFilter
      )
    : studyData.studyboardData;

  const downloadElementRef = useRef();
  // const [selectedFilter, setSelectedFilter] = useState([]);
  // const [selectedSorting, setSelectedSorting] = useState([]);

  // const updateFilters = ({ accessor, filters, value }) => {
  //   const temp = [...selectedFilter, { accessor, value }];
  //   console.log("filterpart", filters, accessor, value);
  //   setSelectedFilter(temp);
  // };

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

  const DateCell = ({ row, column: { accessor } }) => {
    const rowValue = row[accessor];
    const date =
      rowValue && moment(rowValue, "DD-MMM-YYYY").isValid()
        ? moment(rowValue).format("DD-MMM-YYYY")
        : moment(rowValue).format("DD-MMM-YYYY");

    return <span>{date}</span>;
  };

  const obs = ["Failed", "Success", "In Progress"];

  const phases = studyData.uniqurePhase;

  const status = studyData.uniqueProtocolStatus;

  const obIcons = {
    Failed: InFailureIcon,
    "In Progress": InProgressIcon,
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

  const createStringArraySearchFilter = (accessor) => {
    return (row, filters) =>
      !Array.isArray(filters[accessor]) ||
      filters[accessor].length === 0 ||
      filters[accessor].some(
        (value) => value.toUpperCase() === row[accessor]?.toUpperCase()
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
      filterFunction: numberSearchFilter("assignmentcount"),
      filterComponent: IntegerFilter,
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
    ...columns.map((column) => ({ ...column })),
    ...columnsToAdd.map((column) => ({ ...column, hidden: true })),
  ];

  const downloadFile = () => {
    downloadElementRef.current.link.click();
    return false;
  };

  const getTableData = React.useMemo(
    () => (
      <>
        <Table
          title="Studies"
          subtitle={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <IconButton color="primary" onClick={refreshData}>
              <RefreshIcon />
            </IconButton>
          }
          columns={moreColumns}
          rows={studyboardData}
          initialSortedColumn="dateadded"
          initialSortOrder="asc"
          rowsPerPageOptions={[10, 50, 100, "All"]}
          tablePaginationProps={{
            labelDisplayedRows: ({ from, to, count }) =>
              `${count === 1 ? "Item " : "Items"} ${from}-${to} of ${count}`,
            truncate: true,
          }}
          columnSettings={{ enabled: true }}
          CustomHeader={(props) => (
            <CustomButtonHeader downloadFile={downloadFile} {...props} />
          )}
        />
      </>
    ),
    [moreColumns, studyboardData]
  );

  return <div className="study-table">{getTableData}</div>;
}
