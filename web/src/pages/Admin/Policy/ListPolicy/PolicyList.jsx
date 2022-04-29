/* eslint-disable no-restricted-syntax */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useState, useEffect } from "react";
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
import { AppContext } from "../../../../components/Providers/AppProvider";
import {
  getPolicyList,
  updateStatus,
} from "../../../../store/actions/PolicyActions";

import {
  TextFieldFilter,
  createStringArraySearchFilter,
  createStringArrayIncludedFilter,
  getUserInfo,
  getOverflowLimit,
} from "../../../../utils/index";

import "./PolicyList.scss";

const statusList = ["Active", "Inactive"];

const PolicyList = () => {
  const history = useHistory();
  const appContext = useContext(AppContext);
  const { permissions } = appContext.user;
  const [createPermission, setCreatePermission] = useState(false);
  const [readPermission, setReadPermission] = useState(false);
  const [updatePermission, setUpdatePermission] = useState(false);
  const userInfo = getUserInfo();
  const filterMethod = (pPermissions) => {
    const filterpolicyPermissions = pPermissions.filter(
      (item) => item.featureName === "Policy management "
    )[0];
    if (filterpolicyPermissions.allowedPermission.includes("Read")) {
      setReadPermission(true);
    }
    if (filterpolicyPermissions.allowedPermission.includes("Update")) {
      setUpdatePermission(true);
    }
    if (filterpolicyPermissions.allowedPermission.includes("Create")) {
      setCreatePermission(true);
    }
  };
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [policyLists, setPolicyLists] = useState([]);
  const [open, setOpen] = useState(false);
  const [curRow, setCurRow] = useState({});
  const dispatch = useDispatch();
  const policyAdmin = useSelector((state) => state.policy);

  const getData = () => {
    dispatch(getPolicyList());
  };

  const createUniqueData = (arrayList) => {
    const uniquePolicies = Array.from(
      arrayList
        .reduce((acc, { productName, policyId, ...r }) => {
          const current = acc.get(policyId) || {
            ...r,
            policyId,
            productsIncluded: [],
          };
          return acc.set(policyId, {
            ...current,
            productsIncluded: [...current.productsIncluded, productName],
          });
        }, new Map())
        .values()
    );
    const Sorted = uniquePolicies.map((e) => {
      if (e.productsIncluded.length) {
        e.productsIncluded.sort();
        e.productsIncluded = e.productsIncluded.join(", ");
      }
      return e;
    });
    return Sorted;
  };

  useEffect(() => {
    getData();
    if (permissions.length > 0) {
      filterMethod(permissions);
    }
  }, []);

  useEffect(() => {
    const { policyList, uniqueProducts } = policyAdmin;
    setPolicyLists(policyList);
    setProducts(uniqueProducts);
    setLoading(false);
  }, [policyAdmin.loading]);

  useEffect(() => {
    const uniquePolicies = createUniqueData(policyLists);
    setTableRows(uniquePolicies);
  }, [policyLists]);

  // const messageContext = useContext(MessageContext);

  const goToPolicy = (e, id) => {
    if (readPermission) {
      e.preventDefault();
      history.push(`/policy-management/${id}`);
    }
  };

  const handleStatusUpdate = async (e, id, status) => {
    e.preventDefault();
    try {
      const updatePolicyStatus = status === "Active" ? "Inactive" : "Active";
      const payload = {
        policyId: id,
        policyStatus: updatePolicyStatus,
        userId: userInfo.user_id,
      };
      await dispatch(updateStatus(payload));
    } catch (error) {
      console.log("error", error);
    }

    // const selectedData = tableRows.filter((d) => d.policyId === id);
    // const unSelectedData = tableRows.filter((d) => d.policyId !== id);
    // if (selectedData[0].policyStatus === "Active") {
    //   selectedData[0].policyStatus = "Inactive";
    // } else {
    //   selectedData[0].policyStatus = "Active";
    // }

    // setTableRows([...unSelectedData, ...selectedData]);
  };

  const StatusCell = ({ row, column: { accessor } }) => {
    const data = row[accessor];
    const id = row.policyId;
    return (
      <Tooltip
        title={data === "Active" ? "Active" : "Inactive"}
        disableFocusListener
      >
        <Switch
          checked={data === "Active" ? true : false}
          className="table-checkbox"
          onChange={(e) => handleStatusUpdate(e, id, data)}
          size="small"
          disabled={!updatePermission}
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
  function isEllipsisActive(el) {
    const width = el.offsetWidth;
    const widthChild = el.firstChild.offsetWidth;
    return widthChild >= width;
  }
  const LinkCell = ({ row, column: { accessor, width } }) => {
    const rowValue = row[accessor];
    const id = row.policyId;
    const charLimit = getOverflowLimit(width, 80);
    if (rowValue.length < charLimit) {
      return (
        <Link onClick={(e) => goToPolicy(e, id)} disabled={!readPermission}>
          {rowValue}
        </Link>
      );
    }
    return (
      <Link
        onMouseOver={() => handleMouseOver(row)}
        onMouseOut={handleMouseOut}
        disabled={!readPermission}
        onClick={(e) => goToPolicy(e, id)}
      >
        {`${rowValue.slice(0, charLimit - 5)} [...]`}
      </Link>
    );
  };

  const DespCell = ({ row, column: { accessor, width } }) => {
    const data = row[accessor];
    const charLimit = getOverflowLimit(width, 80);
    if (data.length < charLimit) {
      return <>{data}</>;
    }
    return (
      <>
        {data.slice(0, charLimit)}
        <Link
          onMouseOver={() => handleMouseOver(row)}
          onMouseOut={handleMouseOut}
        >
          {` [...]`}
        </Link>
      </>
    );
  };

  const CustomButtonHeader = ({ toggleFilters }) => (
    <div>
      {createPermission && (
        <Button
          size="small"
          variant="secondary"
          icon={PlusIcon}
          onClick={() => history.push("/create-policy")}
          style={{ marginRight: "8px", border: "none", boxShadow: "none" }}
        >
          Create new policy
        </Button>
      )}
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
      width: "20%",
    },
    {
      header: "Policy Description",
      accessor: "policyDescription",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("policyDescription"),
      filterComponent: TextFieldFilter,
      customCell: DespCell,
      width: "40%",
    },
    {
      header: "Products Included",
      accessor: "productsIncluded",
      sortFunction: compareStrings,
      filterFunction: createStringArrayIncludedFilter("productsIncluded"),
      filterComponent: createSelectFilterComponent(products, {
        size: "small",
        multiple: true,
      }),
      width: "30%",
    },
    {
      header: "Status",
      accessor: "policyStatus",
      customCell: StatusCell,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("policyStatus"),
      filterComponent: createSelectFilterComponent(statusList, {
        size: "small",
        multiple: true,
      }),
      width: "10%",
    },
  ];

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
              columns={columns}
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
              showFilterIcon
              CustomHeader={(props) => <CustomButtonHeader {...props} />}
            />
          </>
        )}
      </>
    ),
    [tableRows, loading]
  );

  return (
    <div className="policy-list-wrapper">
      <div className="page-header">
        <div className="page-title">Policy Management</div>
      </div>
      <div className="policy-table">
        <div className="table">{getTableData}</div>
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
                {curRow.policyName}
              </Typography>
              {/* <Typography variant="body2">
                {curRow.policyDescription}
              </Typography> */}
            </div>
          }
        />
      </div>
    </div>
  );
};

export default PolicyList;
