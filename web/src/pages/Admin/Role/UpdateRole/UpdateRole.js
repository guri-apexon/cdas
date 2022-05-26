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
import Button from "apollo-react/components/Button";
import Table, {
  createSelectFilterComponent,
  createStringSearchFilter,
  compareStrings,
  compareNumbers,
} from "apollo-react/components/Table";
import { useHistory, useParams } from "react-router";
import { MessageContext } from "../../../../components/Providers/MessageProvider";
import { getPolicyList } from "../../../../store/actions/PolicyActions";
import "./UpdateRole.scss";
import {
  createStringArrayIncludedFilter,
  getUserInfo,
  inputAlphaNumeric,
  TextFieldFilter,
} from "../../../../utils";
import {
  addRoleService,
  getRoleDetails,
  getRolePolicies,
  updateRoleService,
} from "../../../../services/ApiServices";
import PolicySnapshot from "./PolicySnapshot";
import { AppContext } from "../../../../components/Providers/AppProvider";
import {
  formComponentActive,
  hideAlert,
  showAppSwitcher,
} from "../../../../store/actions/AlertActions";
import AlertBox from "../../../AlertBox/AlertBox";

const UpdateRole = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const params = useParams();
  const [active, setActive] = useState(true);
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
  const routerHandle = useRef();
  const appContext = useContext(AppContext);
  const { permissions } = appContext.user;
  const [RoleUpdatePermission, setUpdateRoleUpdatePermission] = useState(false);
  const userInfo = getUserInfo();
  const [targetRoute, setTargetRoute] = useState("");
  const alertStore = useSelector((state) => state.Alert);
  const [isShowAlertBox, setShowAlertBox] = useState(false);

  const unblockRouter = () => {
    if (routerHandle) {
      routerHandle.current();
    }
  };

  const cancelModalObj = {
    subtitle: "All unsaved changes will be lost.",
    cancelLabel: "Leave without saving",
    cancelAction: () => {
      unblockRouter(); // should be above history push
      history.push("/role-management");
    },
    submitLabel: "Keep editing",
  };
  const filterMethod = (rolePermissions) => {
    const filterrolePermissions = rolePermissions.filter(
      (item) => item.featureName === "Role management"
    )[0];
    if (filterrolePermissions.allowedPermission.includes("Update")) {
      setUpdateRoleUpdatePermission(true);
    }
  };
  const getPolicies = async () => {
    const roleDetails = await getRoleDetails(params.id);
    if (!roleDetails) {
      history.push("/role-management");
    }
    setRoleName(roleDetails.role_nm);
    setRoleDesc(roleDetails.role_desc);
    setActive(roleDetails.role_stat === 1);
    const data = await getRolePolicies(params.id);
    setPageloaded(true);
    setProducts(data.uniqueProducts || []);
    if (data.policyList?.length) {
      const newData = JSON.parse(JSON.stringify(data.policyList));
      setPolicies(newData);
    }
  };

  const SelectionCell = ({ row }) => {
    const [checked, setChecked] = useState(row.selected);
    const setSelected = (e) => {
      row.selected = e.target.checked;
      row.updated = true;
      setChecked(e.target.checked);
    };
    return (
      <>
        <input
          checked={checked}
          type="checkbox"
          className="custom-checkbox"
          disabled={!RoleUpdatePermission}
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
  const tableColumns = [
    {
      header: "Included",
      sortFunction: compareNumbers,
      accessor: "selected",
      customCell: SelectionCell,
      width: "10%",
    },
    {
      header: "Policy Name",
      accessor: "policyName",
      width: "20%",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("policyName"),
      filterComponent: TextFieldFilter,
      customCell: ({ row, column: { accessor } }) => {
        const data = row[accessor];
        if (data.length < 40) {
          if (RoleUpdatePermission) {
            return <Link onClick={() => setSelectedPolicy(row)}>{data}</Link>;
          }
          return <span>{data}</span>;
        }
        return (
          <>
            <Link
              onClick={() => setSelectedPolicy(row)}
              disabled={!RoleUpdatePermission}
            >
              {data.slice(0, 20)}
            </Link>
            <Link
              disabled={!RoleUpdatePermission}
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
      width: "35%",
      customCell: DescriptionCell,
      filterFunction: createStringSearchFilter("policyDescription"),
      filterComponent: TextFieldFilter,
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
      title: roleName,
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
    if (roleName === "") {
      messageContext.showErrorMessage("Role name shouldn't be empty");
      return false;
    }
    if (!policies.filter((x) => x.selected).length && active) {
      messageContext.showErrorMessage(
        "Please complete all mandatory information and then click Save"
      );
      return false;
    }
    const filteredPolicies = policies
      .filter((x) => x.updated)
      .map((x) => {
        return { id: x.policyId, value: x.selected, existed: x.role_plcy_id };
      });
    const reqBody = {
      policies: filteredPolicies,
      name: roleName,
      description: roleDesc,
      status: active ? "1" : "0",
      userId: userInfo.user_id,
      roleId: params.id,
      updated_on: new Date().toISOString(),
    };
    setLoading(true);
    updateRoleService(reqBody)
      .then((res) => {
        messageContext.showSuccessMessage(
          res.message || "Successfully updated"
        );
        unblockRouter(); // should be above history push
        history.push("/role-management");
        setLoading(false);
      })
      .catch((err) => {
        messageContext.showErrorMessage(err.message || "Something went wrong");
        setLoading(false);
      });
  };
  useEffect(() => {
    if (permissions.length > 0) {
      filterMethod(permissions);
    }
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
        history.push(`/policy-management/${selectedPolicy.policyId}`);
      },
      submitLabel: "Keep editing",
    };
    setConfirmObj(confirm);
  };

  const keepEditingBtn = () => {
    dispatch(hideAlert());
    setShowAlertBox(false);
  };

  const leavePageBtn = () => {
    dispatch(hideAlert());
    dispatch(showAppSwitcher());
    setShowAlertBox(false);
  };

  useEffect(() => {
    dispatch(formComponentActive());
  }, []);

  useEffect(() => {
    if (alertStore?.showAlertBox) {
      setShowAlertBox(true);
    }
  }, [alertStore]);

  useEffect(() => {
    routerHandle.current = history.block((tr) => {
      console.log(tr);
      setTargetRoute(tr?.pathname);
      setConfirmObj(cancelModalObj);
      return false;
    });

    return function () {
      /* eslint-disable */
      routerHandle.current.current && routerHandle.current.current();
    };
  });
  const cancelButton = () => {
    unblockRouter();
    if (targetRoute === "") {
      confirmObj.cancelAction();
    } else {
      history.push(targetRoute);
    }
  };
  return (
    <div className="create-role-wrapper">
      <Box className="top-content">
        {isShowAlertBox && (
          <AlertBox cancel={keepEditingBtn} submit={leavePageBtn} />
        )}
        {confirmObj && (
          <Modal
            disableBackdropClick="true"
            open={confirmObj ? true : false}
            onClose={() => setConfirmObj(null)}
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
                onClick: () => cancelButton(),
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
            disabled={!RoleUpdatePermission}
            size="small"
          />
          {RoleUpdatePermission && (
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
          )}
        </div>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Box>
            <div className="flex create-sidebar flexWrap">
              {!RoleUpdatePermission && (
                <Button
                  onClick={() => history.goBack()}
                  className="back-btn"
                  variant="primary"
                  size="small"
                  // icon={PlusIcon}
                >
                  &#x276E; Back to Role Management List
                </Button>
              )}
              <Typography variant="title1" className="b-font title">
                {roleName}
              </Typography>
              <br />
              {RoleUpdatePermission ? (
                <>
                  <TextField
                    id="roleName"
                    size="small"
                    value={roleName}
                    label="Role Name"
                    placeholder="Name your role"
                    onChange={handleChange}
                  />
                  <TextField
                    id="roleDesc"
                    size="small"
                    value={roleDesc}
                    label="Role Description"
                    placeholder="Describe your role"
                    rows="18"
                    multiline={true}
                    minHeight={150}
                    sizeAdjustable
                    onChange={handleChange}
                  />
                </>
              ) : (
                <>
                  <br />
                  <Typography variant="body2">Role Description</Typography>
                  <Typography className="b-font">{roleDesc}</Typography>
                </>
              )}
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

export default UpdateRole;
