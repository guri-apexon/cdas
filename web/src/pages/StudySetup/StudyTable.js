import React from "react";
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
import Question from "apollo-react-icons/Question";
import Rocket from "apollo-react-icons/Rocket";
import moment from "moment";

import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import DateRangePickerV2 from "apollo-react/components/DateRangePickerV2";
import IconButton from "apollo-react/components/IconButton";
import { TextField } from "apollo-react/components/TextField/TextField";

// const CustomHeader = ({
//   onBulkEdit,
//   onBulkDelete,
//   selectedRows,
//   toggleFilters,
// }) => {
//   const menuItems = [
//     {
//       text: "Edit",
//       onClick: onBulkEdit,
//     },
//     {
//       text: "Delete",
//       onClick: onBulkDelete,
//     },
//   ];

//   return (
//     <div>
//       <MenuButton
//         buttonText="Bulk actions"
//         size="small"
//         menuItems={menuItems}
//         disabled={selectedRows.length === 0}
//         style={{ marginRight: 8 }}
//       />
//       <Button
//         size="small"
//         variant="secondary"
//         icon={FilterIcon}
//         onClick={toggleFilters}
//       >
//         {"Filter"}
//       </Button>
//     </div>
//   );
// };

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
  console.log("date", rowValue);
  const date = moment(rowValue, "MM/DD/YYYY").format("M/D/YYYY");
  // : rowValue;

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

const obs = ["In-progress", "Failure", "Success"];

const obIcons = {
  "In-progress": Rocket,
  Failure: Cog,
};

const SelectiveCell = ({ row, column: { accessor } }) => {
  const onboardingprogress = row[accessor];
  const Icon = obIcons[onboardingprogress] || Question;
  return (
    <div style={{ position: "relative" }}>
      <Icon fontSize="small" style={{ position: "relative", top: 5 }} />
      {onboardingprogress || "Unknown"}
    </div>
  );
};

export function createStringArraySearchFilter(accessor) {
  return (row, filters) =>
    !Array.isArray(filters[accessor]) ||
    filters[accessor].length === 0 ||
    filters[accessor].some(
      (value) => value.toUpperCase() === row[accessor]?.toUpperCase()
    );
}

export default function StudyTable({ studyData }) {
  // console.log("rowsWith", rowsWithExtra, rows, studyData);
  const { studyboardData } = studyData;

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
      filterFunction: createStringSearchFilter("phase"),
      filterComponent: createAutocompleteFilter(
        studyboardData
          .filter(({ phase }) => phase)
          .map(({ phase }) => ({ label: phase }))
      ),
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
      customCell: DateCell,
      filterFunction: dateFilterV2("dateadded"),
      filterComponent: DateFilter,
    },
    {
      header: "Date Edited",
      accessor: "dateedited",
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
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("assignmentcoun"),
      filterComponent: TextFieldFilter,
      // sortFunction: compareNumbers,
      // filterFunction: numberSearchFilter("assignmentcount"),
      // filterComponent: IntegerFilter,
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

  return (
    <div className="study-table">
      <Table
        title="Studies"
        columns={moreColumns}
        rows={studyboardData}
        initialSortedColumn="protocolnumber"
        initialSortOrder="asc"
        rowsPerPageOptions={[10, 50, 100, "All"]}
        tablePaginationProps={{
          labelDisplayedRows: ({ from, to, count }) =>
            `${count === 1 ? "Item " : "Items"} ${from}-${to} of ${count}`,
          truncate: true,
        }}
        columnSettings={{ enabled: true }}
        headerProps={{}}
      />
      ;
    </div>
  );
}
