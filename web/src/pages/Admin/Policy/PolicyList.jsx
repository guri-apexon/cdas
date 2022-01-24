import React, { useState, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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

export default function PolicyList() {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = React.useState(true);
  const [tableRows, setTableRows] = useState([]);
  const dispatch = useDispatch();
  const policyAdmin = useSelector((state) => state.policyAdmin);
  useEffect(() => {
    dispatch(getPolicyList());
  }, []);

  useEffect(() => {
    setLoading(policyAdmin.loading);
    setTableRows(policyAdmin.policyList);
    console.log("policy", policyAdmin);
  }, [policyAdmin.loading]);
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

  const handleInActivate = (e, id) => {
    // setValue(checked);
    console.log(id);
  };

  const handleActivate = (e, id) => {
    // setValue(checked);
    console.log(id);
  };

  const StatusCell = ({ row, column: { accessor } }) => {
    const data = row[accessor];
    const id = row.policyId;
    if (data === "Active") {
      return (
        <Switch
          label="Label"
          checked={true}
          onChange={(e) => handleInActivate(e, id)}
        />
      );
    }
    return (
      <Switch
        label="Label"
        checked={false}
        onChange={(e) => handleActivate(e, id)}
      />
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
      filterComponent: createSelectFilterComponent(productsIncluded, {
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

  const moreColumns = [...columns];

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
              // rowId="policyId"
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
