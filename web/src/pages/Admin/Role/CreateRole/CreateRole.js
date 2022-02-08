import Box from "apollo-react/components/Box";
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Switch from "apollo-react/components/Switch";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import TextField from "apollo-react/components/TextField";
import Typography from "apollo-react/components/Typography";
import Grid from "apollo-react/components/Grid";
import Link from "apollo-react/components/Link";
import Table, {
  createSelectFilterComponent,
  createStringSearchFilter,
  compareStrings,
} from "apollo-react/components/Table";
import { useHistory } from "react-router";
import { MessageContext } from "../../../../components/Providers/MessageProvider";
import { getPolicyList } from "../../../../store/actions/PolicyAdminActions";
import "./CreateRole.scss";
import { getUserInfo, inputAlphaNumeric } from "../../../../utils";
import { addRoleService } from "../../../../services/ApiServices";
import PolicySnapshot from "./PolicySnapshot";

const CreateRole = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const messageContext = useContext(MessageContext);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [policies, setPolicies] = useState([]);
  const userInfo = getUserInfo();
  const policyAdmin = useSelector((state) => state.policyAdmin);
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
  const tableColumns = [
    {
      header: "Included",
      accessor: "",
      customCell: selectionCell,
    },
    {
      header: "Policy Name",
      accessor: "policyName",
      customCell: ({ row, column: { accessor } }) => {
        return (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <Link onClick={() => setSelectedPolicy(row)}>{row[accessor]}</Link>
        );
      },
    },
    {
      header: "Policy Description",
      accessor: "policyDescription",
    },
    {
      header: "Product Included",
      accessor: "products",
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
  const handleChangeTab = (event, v) => {
    console.log("V", v);
  };
  // eslint-disable-next-line consistent-return
  const submitRole = () => {
    const reqBody = {
      policies: policies.filter((x) => x.selected).map((x) => x.policyId),
      name: roleName,
      description: roleDesc,
      status: active,
      userId: userInfo.user_id,
    };
    if (roleName === "") {
      messageContext.showErrorMessage("Role Name shouldn't be empty");
      return false;
    }
    if (!reqBody.policies.length) {
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
        history.push("/role-management");
        setLoading(false);
      })
      .catch((err) => {
        messageContext.showErrorMessage(err.message || "Something went wrong");
        setLoading(false);
      });
  };
  useEffect(() => {
    if (policyAdmin.policyList?.length) {
      const data = JSON.parse(JSON.stringify(policyAdmin.policyList));
      setPolicies(data);
    }
  }, [policyAdmin]);
  useEffect(() => {
    getPolicies();
  }, []);
  const getPolicyTable = React.useMemo(() => {
    return (
      <Table
        isLoading={loading}
        title="Policies"
        columns={tableColumns}
        rows={policies}
        rowId="policyId"
        hasScroll={true}
        maxHeight="calc(100vh - 162px)"
        // initialSortedColumn="policyName"
        // initialSortOrder="asc"
        rowsPerPageOptions={[10, 50, 100, "All"]}
        tablePaginationProps={{
          labelDisplayedRows: ({ from, to, count }) =>
            `${count === 1 ? "Policy " : "Policies"} ${from}-${to} of ${count}`,
          truncate: true,
        }}
        showFilterIcon
      />
    );
  }, [policies]);
  return (
    <div className="create-role-wrapper">
      <Box className="top-content">
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
                onClick: () => history.push("/policy-management"),
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
        </Grid>
      </Grid>
      <PolicySnapshot
        policy={selectedPolicy}
        closeSnapshot={() => setSelectedPolicy(null)}
      />
    </div>
  );
};

export default CreateRole;
