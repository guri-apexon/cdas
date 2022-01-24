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

export default function PolicyList() {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [tableRows, setTableRows] = useState([]);
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
    // const selectedData = tableRows.filter((d) => d.policyId === id);
    // const newData = [...tableRows, selectedData];
    // setTableRows([...tableRows, newData]);
    console.log("tableRows", tableRows, products, id);
  };

  const handleActivate = (e, id) => {
    e.preventDefault();
    // console.log(id);
    // const newData = tableRows.filter((d) => d.policyId === id);
    // newData.policyStatus = "Active";
    // setTableRows([...tableRows, newData]);
    console.log("tableRows", tableRows, products, id);
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
