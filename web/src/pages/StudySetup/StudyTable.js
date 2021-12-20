import React, { useEffect, useState } from "react";
import Table, {
  compareDates,
  compareNumbers,
  compareStrings,
  createSelectFilterComponent,
  createStringSearchFilter,
  dateFilterV2,
  numberSearchFilter,
} from "apollo-react/components/Table";
import Cog from "apollo-react-icons/Cog";
import Rocket from "apollo-react-icons/Rocket";
import moment from "moment";

import Button from "apollo-react/components/Button";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import DateRangePickerV2 from "apollo-react/components/DateRangePickerV2";
import DownloadIcon from "apollo-react-icons/Download";
import FilterIcon from "apollo-react-icons/Filter";
import RefreshIcon from "apollo-react-icons/Refresh";
import IconButton from "apollo-react/components/IconButton";
import { TextField } from "apollo-react/components/TextField/TextField";

const TextFieldFilter = ({ accessor, filters, updateFilterValue }) => {
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

export const IntegerFilter = ({ accessor, filters, updateFilterValue }) => {
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
          minWidth: 144,
          maxWidth: 200,
          position: "relative",
          height,
        }}
      >
        <AutocompleteV2
          style={{ position: "absolute", left: 0, right: 0 }}
          value={value ? value.map((label) => ({ label })) : []}
          name={accessor}
          source={source}
          // eslint-disable-next-line no-shadow
          onChange={(event, value) =>
            updateFilterValue({
              target: {
                name: accessor,
                value: value.map(({ label }) => label),
              },
            })
          }
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
          showSelectAll
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          ref={ref}
        />
      </div>
    );
  };

const obs = ["Failed", "Success", "In Progress"];

const phases = [
  "Phase 4",
  "Phase 3",
  "Phase 3b",
  "Phase 2",
  "Phase 1",
  "Phase 0",
  "N/A",
];

const obIcons = {
  Failed: Cog,
  "In Progress": Rocket,
};

const SelectiveCell = ({ row, column: { accessor } }) => {
  const onboardingprogress = row[accessor];
  const Icon = obIcons[onboardingprogress] || "noIcon";
  if (Icon === "noIcon") {
    return (
      <div style={{ position: "relative", marginLeft: 25 }}>
        {onboardingprogress}
      </div>
    );
  }
  return (
    <div style={{ position: "relative" }}>
      <Icon
        fontSize="small"
        style={{ position: "relative", top: 5, marginRight: 5 }}
      />
      {onboardingprogress}
    </div>
  );
};

export function createStringArraySearchFilter(accessor, filterStr = "") {
  return (row, filters) =>
    !Array.isArray(filters[accessor]) ||
    filters[accessor].length === 0 ||
    filters[accessor].some((value) => {
      if (filterStr) {
        return filterStr.toUpperCase() === row[accessor]?.toUpperCase();
      }
      return value.toUpperCase() === row[accessor]?.toUpperCase();
    });
}

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

export default function StudyTable({ studyData, refreshData, selectedFilter }) {
  // console.log("rowsWith", rowsWithExtra, rows, studyData);
  const studyboardData = selectedFilter
    ? studyData?.studyboardData.filter(
        (data) => data.onboardingprogress === selectedFilter
      )
    : studyData.studyboardData;

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
      filterFunction: createStringSearchFilter("protocolstatus"),
      filterComponent: createAutocompleteFilter(
        studyboardData
          .filter(({ protocolstatus }) => protocolstatus)
          .map(({ protocolstatus }) => ({ label: protocolstatus }))
      ),
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
      accessor: "assignmentcoun",
      sortFunction: compareNumbers,
      filterFunction: numberSearchFilter("assignmentcoun"),
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

  const downloadFile = () => {};
  return (
    <div className="study-table">
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
      ;
    </div>
  );
}
