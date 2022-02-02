/* eslint-disable no-script-url */
/* eslint-disable react/button-has-type */
import React, { useContext, useEffect, useState } from "react";
import Box from "apollo-react/components/Box";
import { useHistory, useParams } from "react-router";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Switch from "apollo-react/components/Switch";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import TextField from "apollo-react/components/TextField";
import "./UpdatePolicy.scss";
import Typography from "apollo-react/components/Typography";
import Button from "apollo-react/components/Button";
import Grid from "apollo-react/components/Grid";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import Badge from "apollo-react/components/Badge";
import Modal from "apollo-react/components/Modal";
import {
  updatePolicyService,
  fetchProducts,
  getPolicyPermissions,
} from "../../../../services/ApiServices";
import { MessageContext } from "../../../../components/Providers/MessageProvider";
import PermissionTable from "./PermissionTable";
import { getUserInfo, inputAlphaNumeric } from "../../../../utils";

const ConfirmModal = React.memo(({ open, cancel, submitPolicy, loading }) => {
  return (
    <Modal
      open={open}
      className="save-confirm"
      variant="warning"
      title="Save before exiting?"
      message="You have unsaved changes. Do you want to save before exiting?"
      buttonProps={[
        { label: "Don't save", onClick: cancel, disabled: loading },
        { label: "Save", onClick: submitPolicy, disabled: loading },
      ]}
      id="neutral"
    />
  );
});

const UpdatePolicy = () => {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [active, setActive] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [policyDetails, setPolicyDetails] = useState({});
  const [policyName, setPolicyName] = useState("");
  const [policyDesc, setPolicyDesc] = useState("");
  const [permissions, setPermissions] = useState({});
  const [products, setProducts] = useState([]);
  const messageContext = useContext(MessageContext);
  const userInfo = getUserInfo();
  const history = useHistory();
  const handleActive = (e, checked) => {
    setActive(checked);
  };
  const handleChangeTab = (event, v) => {
    setCurrentTab(v);
  };

  const breadcrumpItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/launchpad") },
    {
      href: "javascript:void(0)",
      title: "Policy Management",
      onClick: () => history.push("/policy-management"),
    },
    {
      title: "View Policy",
    },
  ];

  // eslint-disable-next-line consistent-return
  const submitPolicy = async () => {
    const reqBody = {
      policyName,
      policyDesc,
      permissions,
      policyId: policyDetails.plcy_id,
      userId: userInfo.user_id,
      status: active ? "Active" : "Inactive",
    };
    if (policyName === "") {
      messageContext.showErrorMessage("Policy Name shouldn't be empty");
      return false;
    }
    let atleastOneSelected = false;
    if (active) {
      Object.keys(permissions).forEach((product) => {
        permissions[product].every((category) => {
          if (!atleastOneSelected) {
            atleastOneSelected = category.permsn_nm.find((x) => {
              return x.value === true;
            });
          }
          if (atleastOneSelected) return false;
          return true;
        });
      });
      if (!atleastOneSelected) {
        messageContext.showErrorMessage(
          "Please complete all mandatory information and then click Save"
        );
        return false;
      }
    }
    setLoading(true);
    updatePolicyService(reqBody)
      .then((res) => {
        messageContext.showSuccessMessage(
          res.message || "Successfully Updated"
        );
        history.push("/policy-management");
        setLoading(false);
      })
      .catch((err) => {
        messageContext.showErrorMessage(err.message || "Something went wrong");
        setLoading(false);
      });
  };
  const handleChange = (e) => {
    const val = e.target.value;
    if (e.target.id === "policyName") {
      inputAlphaNumeric(e, (v) => {
        setPolicyName(v);
      });
    } else if (e.target.id === "policyDesc") {
      setPolicyDesc(val);
    }
  };
  const filterPermission = (arr) => {
    const helper = {};
    return arr.reduce((r, o) => {
      const key = `${o.ctgy_nm}-${o.feat_nm}`;
      const checked = o.select_check_box === "1" ? true : false;
      if (!helper[key]) {
        helper[key] = {
          ...o,
          permsn_nm: [
            {
              name: o.permsn_nm,
              value: checked,
              id: o.plcy_prod_permsn_id,
            },
          ],
        };
        r.push(helper[key]);
      } else {
        helper[key].permsn_nm = [
          ...helper[key].permsn_nm,
          {
            name: o.permsn_nm,
            value: checked,
            id: o.plcy_prod_permsn_id,
          },
        ];
      }
      return r;
    }, []);
  };
  const fetchPermissions = async () => {
    const permissionsData = await getPolicyPermissions(params.id);
    const filteredData = filterPermission(permissionsData.data);
    setPolicyDetails(permissionsData.policyDetails);
    setPolicyName(permissionsData.policyDetails?.plcy_nm || "");
    setPolicyDesc(permissionsData.policyDetails?.plcy_desc || "");
    setActive(
      permissionsData.policyDetails?.plcy_stat === "Active" ? true : false
    );
    const permissionArr = {};
    products.forEach((product) => {
      const filtered = filteredData.filter(
        (x) => x.prod_nm === product.prod_nm
      );
      permissionArr[product.prod_nm] = filtered;
    });
    setPermissions(permissionArr);
  };
  const getProducts = async () => {
    const productsData = await fetchProducts();
    setProducts(productsData);
  };
  const updateData = (childData) => {
    const newArr = { ...permissions, [childData.product]: childData.data };
    setPermissions(newArr);
  };
  const getBadgeCount = (product) => {
    let count = 0;
    if (!permissions[product]) {
      return count;
    }
    permissions[product].forEach((category) => {
      count += category.permsn_nm.filter((x) => {
        return x.value === true;
      }).length;
    });
    return count;
  };
  const cancelEdit = () => {
    history.push("/policy-management");
  };
  useEffect(() => {
    fetchPermissions();
  }, [products]);
  useEffect(() => {
    getProducts();
  }, []);
  return (
    <div className="update-policy-wrapper">
      <ConfirmModal
        open={confirm}
        cancel={cancelEdit}
        loading={loading}
        submitPolicy={submitPolicy}
      />
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
          {active && (
            <ButtonGroup
              className="action-buttons"
              alignItems="right"
              buttonProps={[
                {
                  label: "Cancel",
                  size: "small",
                  onClick: setConfirm,
                },
                {
                  label: "Save",
                  size: "small",
                  disabled: loading,
                  onClick: submitPolicy,
                },
              ]}
            />
          )}
        </div>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Box>
            <div className="flex update-sidebar flexWrap">
              {!active && (
                <Button
                  onClick={() => history.goBack()}
                  className="back-btn"
                  variant="primary"
                  size="small"
                  // icon={PlusIcon}
                >
                  &#x276E; Back to Policy Management List
                </Button>
              )}
              <Typography variant="title1" className="b-font title">
                {policyName}
              </Typography>
              <br />
              {active ? (
                <>
                  <TextField
                    id="policyName"
                    size="small"
                    label="Policy Name"
                    value={policyName}
                    placeholder="Name your policy"
                    onChange={handleChange}
                  />
                  <TextField
                    id="policyDesc"
                    size="small"
                    label="Policy Description"
                    placeholder="Describe your policy"
                    rows="18"
                    value={policyDesc}
                    multiline={true}
                    minHeight={150}
                    sizeAdjustable
                    onChange={handleChange}
                  />
                </>
              ) : (
                <>
                  <br />
                  <Typography variant="body2">Policy Description</Typography>
                  <Typography className="b-font">{policyDesc}</Typography>
                </>
              )}
            </div>
          </Box>
        </Grid>
        <Grid item xs={9} className="products-wrapper">
          <br />
          <Tabs
            value={currentTab}
            onChange={handleChangeTab}
            truncate
            className="product-tabs"
          >
            {products &&
              products.map((product, i) => {
                return (
                  <Tab
                    label={
                      // eslint-disable-next-line react/jsx-wrap-multilines
                      <Badge
                        badgeContent={getBadgeCount(product.prod_nm)}
                        max={999}
                      >
                        {product.prod_nm}
                      </Badge>
                    }
                  />
                );
              })}
          </Tabs>
          <div className="product-content">
            {products &&
              products.map((product, i) => {
                if (currentTab !== i) {
                  return false;
                }
                return (
                  <PermissionTable
                    disabled={!active}
                    messageContext={messageContext}
                    title={product.prod_nm}
                    updateData={updateData}
                    data={permissions[product.prod_nm] || []}
                  />
                );
              })}
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default UpdatePolicy;
