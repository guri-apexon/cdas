import React, { useState, useContext, useEffect } from "react";

import Table, {
  createSelectFilterComponent,
  createStringSearchFilter,
  compareStrings,
} from "apollo-react/components/Table";
import Button from "apollo-react/components/Button";
import PlusIcon from "apollo-react-icons/Plus";
import FilterIcon from "apollo-react-icons/Filter";
import Link from "apollo-react/components/Link";
import { useHistory } from "react-router-dom";
// import IconButton from "apollo-react/components/IconButton";
import Typography from "apollo-react/components/Typography";
import Progress from "../../../components/Progress";
// import { MessageContext } from "../../../components/MessageProvider";

import {
  TextFieldFilter,
  createStringArraySearchFilter,
} from "../../../utils/index";

import "./PolicyList.scss";

export default function PolicyList() {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  // const messageContext = useContext(MessageContext);

  const studyboardData = [];

  const productsIncluded = ["Failed", "Success", "In Progress"];

  const LinkCell = ({ row, column: { accessor } }) => {
    const rowValue = row[accessor];
    return (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <Link onClick={() => console.log(`link clicked ${rowValue}`)}>
        {rowValue}
      </Link>
    );
  };

  const SelectiveCell = ({ row, column: { accessor } }) => {
    const onboardingprogress = row[accessor];
    const Img = "noIcon";
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

  const CustomButtonHeader = ({ toggleFilters }) => (
    <div>
      <Button
        size="small"
        variant="secondary"
        icon={PlusIcon}
        onClick={() => history.push("/")}
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
      header: "Policy Name",
      accessor: "policyName",
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
      filterComponent: createSelectFilterComponent(productsIncluded, {
        size: "small",
        multiple: true,
      }),
    },

    {
      header: "Status",
      accessor: "status",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("status"),
      filterComponent: TextFieldFilter,
    },
  ];

  const moreColumns = [...columns];

  const [tableRows, setTableRows] = useState([...studyboardData]);
  const [tableColumns, setTableColumns] = useState([...moreColumns]);

  // useEffect(() => {
  //   if (!studyData.loading || studyData.studyboardFetchSuccess) {
  //     setLoading(false);
  //     setTableRows([...studyboardData]);
  //     setExportTableRows([...studyboardData]);
  //     setTableColumns([...moreColumns]);
  //   } else {
  //     setLoading(true);
  //   }
  // }, [studyData.loading, studyboardData, studyData.studyboardFetchSuccess]);

  useEffect(() => {
    setTableColumns([...moreColumns]);
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
              title="Policies"
              columns={tableColumns}
              rows={tableRows}
              rowId="policyId"
              hasScroll={true}
              maxHeight="calc(100vh - 162px)"
              initialSortedColumn="policyName"
              initialSortOrder="asc"
              rowsPerPageOptions={[10, 50, 100, "All"]}
              tablePaginationProps={{
                labelDisplayedRows: ({ from, to, count }) =>
                  `${
                    count === 1 ? "Item " : "Items"
                  } ${from}-${to} of ${count}`,
                truncate: true,
              }}
              CustomHeader={(props) => <CustomButtonHeader {...props} />}
            />
          </>
        )}
      </>
    ),
    [tableColumns, tableRows, loading]
  );

  return (
    <div className="policy-list-wrapper">
      <div className="page-header">
        <Typography variant="h2" gutterBottom>
          Policy Management
        </Typography>
      </div>
      <div className="policy-table">{getTableData}</div>
    </div>
  );
}
