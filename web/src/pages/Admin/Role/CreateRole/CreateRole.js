/* eslint-disable jsx-a11y/anchor-is-valid */
import Box from "apollo-react/components/Box";
import React, { useContext, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Switch from "apollo-react/components/Switch";
import Peek from "apollo-react/components/Peek";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import TextField from "apollo-react/components/TextField";
import Typography from "apollo-react/components/Typography";
import Grid from "apollo-react/components/Grid";
import Modal from "apollo-react/components/Modal";
import Link from "apollo-react/components/Link";
import Table, {
  createSelectFilterComponent,
  createStringSearchFilter,
  compareStrings,
} from "apollo-react/components/Table";
import { useHistory } from "react-router";
import { MessageContext } from "../../../../components/Providers/MessageProvider";
import { getPolicyList } from "../../../../store/actions/PolicyActions";
import "./CreateRole.scss";
import {
  createStringArrayIncludedFilter,
  getUserInfo,
  inputAlphaNumeric,
  TextFieldFilter,
} from "../../../../utils";
import { addRoleService } from "../../../../services/ApiServices";
import PolicySnapshot from "./PolicySnapshot";

const CreateRole = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [active, setActive] = useState(false);
  const [confirmObj, setConfirmObj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageloaded, setPageloaded] = useState(false);
  const [peekRow, setPeekRow] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const messageContext = useContext(MessageContext);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [policies, setPolicies] = useState([]);
  const [products, setProducts] = useState([]);
  const userInfo = getUserInfo();
  const policyStore = useSelector((state) => state.policy);
  const routerHandle = useRef();
  const unblockRouter = () => {
    if (routerHandle) {
      routerHandle.current();
    }
  };
  const getPolicies = () => {
    dispatch(getPolicyList(true));
  };

  const selectionCell = ({ row }) => {
    const setSelected = (e) => {
      row.selected = e.target.checked;
    };
    return (
      <>
        <input
          type="checkbox"
          className="custom-checkbox"
          onChange={setSelected}
        />
      </>
    );
  };

  const DescriptionCell = ({ row, column: { accessor } }) => {
    const data = row[accessor];
    if (data.length < 80) {
      return <>{data}</>;
    }
    return (
      <>
        {data.slice(0, 50)}
        <Link
          onMouseOver={() => setPeekRow(row)}
          onMouseOut={() => setPeekRow(null)}
        >
          {`  [...]`}
        </Link>
      </>
    );
  };
  const cancelModalObj = {
    subtitle: "All unsaved changes will be lost.",
    submitLabel: "Keep editing",
    cancelLabel: "Leave without saving",
    cancelAction: () => {
      unblockRouter();
      history.push("/role-management");
    },
  };
  const tableColumns = [
    {
      header: "Included",
      accessor: "",
      customCell: selectionCell,
      width: "10%",
    },
    {
      header: "Policy Name",
      accessor: "policyName",
      sortFunction: compareStrings,
      width: "20%",
      filterFunction: createStringSearchFilter("policyName"),
      filterComponent: TextFieldFilter,
      customCell: ({ row, column: { accessor } }) => {
        const data = row[accessor];
        if (data.length < 40) {
          return <Link onClick={() => setSelectedPolicy(row)}>{data}</Link>;
        }
        return (
          <>
            <Link onClick={() => setSelectedPolicy(row)}>
              {data.slice(0, 20)}
            </Link>
            <Link
              onMouseOver={() => setPeekRow(row)}
              onMouseOut={() => setPeekRow(null)}
            >
              {`  [...]`}
            </Link>
          </>
        );
      },
    },
    {
      header: "Policy Description",
      accessor: "policyDescription",
      sortFunction: compareStrings,
      customCell: DescriptionCell,
      filterFunction: createStringSearchFilter("policyDescription"),
      filterComponent: TextFieldFilter,
      width: "35%",
    },
    {
      header: "Product Included",
      accessor: "products",
      width: "35%",
      sortFunction: compareStrings,
      filterFunction: createStringArrayIncludedFilter("products"),
      filterComponent: createSelectFilterComponent(products, {
        size: "small",
        multiple: true,
      }),
    },
  ];
  const breadcrumpItems = [
    { href: "", onClick: () => history.push("/launchpad") },
    {
      href: "",
      title: "Role Management",
      onClick: () => history.push("/role-management"),
    },
    {
      title: "Create New Role",
    },
  ];
  const handleActive = (e, checked) => {
    setActive(checked);
  };
  const handleChange = (e) => {
    const val = e.target.value;
    if (e.target.id === "roleName") {
      inputAlphaNumeric(e, (v) => {
        setRoleName(v);
      });
    } else if (e.target.id === "roleDesc") {
      setRoleDesc(val);
    }
  };
  // eslint-disable-next-line consistent-return
  const submitRole = () => {
    const reqBody = {
      policies: policies.filter((x) => x.selected).map((x) => x.policyId),
      name: roleName,
      description: roleDesc,
      status: active ? "1" : "0",
      userId: userInfo.user_id,
    };
    if (roleName === "") {
      messageContext.showErrorMessage("Role Name shouldn't be empty");
      return false;
    }
    if (roleName.length > 255) {
      messageContext.showErrorMessage(
        "Role name should not allowed to save with more than 255 characters. Max length is 255"
      );
      return false;
    }
    if (!reqBody.policies.length && active) {
      messageContext.showErrorMessage(
        "Please complete all mandatory information and then click Save"
      );
      return false;
    }
    console.log("ReqBody:", reqBody);
    setLoading(true);
    addRoleService(reqBody)
      .then((res) => {
        messageContext.showSuccessMessage(
          res.message || "Successfully Created"
        );
        unblockRouter();
        history.push("/role-management");
        setLoading(false);
      })
      .catch((err) => {
        messageContext.showErrorMessage(err.message || "Something went wrong");
        setLoading(false);
      });
  };
  useEffect(() => {
    if (policyStore.policyList?.length) {
      const data = JSON.parse(JSON.stringify(policyStore.policyList));
      setPolicies(data);
      setPageloaded(true);
      setProducts(policyStore.uniqueProducts || []);
    }
  }, [policyStore]);
  useEffect(() => {
    getPolicies();
  }, []);
  const getPolicyTable = React.useMemo(() => {
    return (
      <Table
        isLoading={!pageloaded}
        title="Policies"
        columns={tableColumns}
        rows={policies}
        rowId="policyId"
        hasScroll
        maxHeight="calc(100vh - 360px)"
        initialSortedColumn="policyName"
        initialSortOrder="asc"
        rowsPerPageOptions={[10, 50, 100, "All"]}
        tablePaginationProps={{
          labelDisplayedRows: ({ from, to, count }) =>
            `${count === 1 ? "Policy " : "Policies"} ${from}-${to} of ${count}`,
          truncate: true,
        }}
      />
    );
  }, [policies]);

  const setConfirmCancel = () => {
    setConfirmObj(cancelModalObj);
  };
  // eslint-disable-next-line consistent-return
  const setConfirmViewPolicy = (param) => {
    if (!param) {
      setSelectedPolicy(null);
      return false;
    }
    const confirm = {
      subtitle: "All unsaved changes will be lost.",
      cancelLabel: "Leave without saving",
      cancelAction: () => {
        unblockRouter();
        setSelectedPolicy(null);
        history.push(`policy-management/${selectedPolicy.policyId}`);
      },
      submitLabel: "Keep editing",
    };
    setConfirmObj(confirm);
  };

  useEffect(() => {
    routerHandle.current = history.block((tx) => {
      setConfirmObj(cancelModalObj);
      return false;
    });

    return function () {
      /* eslint-disable */
      routerHandle.current.current && routerHandle.current.current();
    };
  });
  return (
    <div className="create-role-wrapper">
      <Box className="top-content">
        {confirmObj && (
          <Modal
            open={confirmObj ? true : false}
            onClose={() => setConfirmObj(null)}
            disableBackdropClick="true"
            className="save-confirm"
            variant="warning"
            title="Lose your work?"
            message={confirmObj.subtitle}
            buttonProps={[
              {
                label: confirmObj.submitLabel,
                onClick: () => setConfirmObj(null),
                disabled: loading,
              },
              {
                label: confirmObj.cancelLabel,
                onClick: () => confirmObj.cancelAction(),
                disabled: loading,
              },
            ]}
            id="neutral"
          />
        )}
        <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
        <div className="flex top-actions">
          <Switch
            label="Active"
            className="inline-checkbox"
            checked={active}
            onChange={handleActive}
            size="small"
          />
          <ButtonGroup
            alignItems="right"
            buttonProps={[
              {
                label: "Cancel",
                size: "small",
                onClick: () => setConfirmCancel(),
              },
              {
                label: "Save",
                size: "small",
                disabled: loading,
                onClick: submitRole,
              },
            ]}
          />
        </div>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Box>
            <div className="flex create-sidebar flexWrap">
              <Typography variant="title1" className="b-font title">
                New Role
              </Typography>
              <br />
              <TextField
                id="roleName"
                size="small"
                label="Role Name"
                placeholder="Name your role"
                onChange={handleChange}
              />
              <TextField
                id="roleDesc"
                size="small"
                label="Role Description"
                placeholder="Describe your role"
                rows="18"
                multiline={true}
                minHeight={150}
                sizeAdjustable
                onChange={handleChange}
              />
            </div>
          </Box>
        </Grid>
        <Grid item xs={9} className="policies-wrapper">
          {getPolicyTable}
          {peekRow && (
            <Peek
              open={peekRow}
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
                    {peekRow.policyName}
                  </Typography>
                  <Typography variant="body2">
                    {peekRow.policyDescription}
                  </Typography>
                </div>
              }
            />
          )}
        </Grid>
      </Grid>
      {selectedPolicy && (
        <PolicySnapshot
          policy={selectedPolicy}
          closeSnapshot={setConfirmViewPolicy}
        />
      )}
    </div>
  );
};

export default CreateRole;
