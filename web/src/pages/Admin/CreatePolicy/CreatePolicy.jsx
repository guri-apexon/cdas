/* eslint-disable react/button-has-type */
import React, { useContext, useEffect, useState } from "react";
import Box from "apollo-react/components/Box";
import { useHistory } from "react-router";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Switch from "apollo-react/components/Switch";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import TextField from "apollo-react/components/TextField";
import "./CreatePolicy.scss";
import Typography from "apollo-react/components/Typography";
import Grid from "apollo-react/components/Grid";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import {
  addPolicyService,
  fetchProducts,
  getPolicyPermissions,
} from "../../../services/ApiServices";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import PermissionTable from "./PermissionTable";
import { getUserInfo, inputAlphaNumeric } from "../../../utils";

const breadcrumpItems = [
  { href: "/" },
  {
    title: "Policy Management",
    href: "/policy-management",
  },
  {
    title: "Create New Policy",
  },
];

const CreatePolicy = () => {
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
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
  // eslint-disable-next-line consistent-return
  const submitPolicy = async () => {
    const reqBody = {
      policyName,
      policyDesc,
      permissions,
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
            atleastOneSelected = Object.keys(category.permsn_nm).find((x) => {
              return category.permsn_nm[x] === true;
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
    addPolicyService(reqBody)
      .then((res) => {
        messageContext.showSuccessMessage(res.message || "Successfully Done");
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
      if (!helper[key]) {
        helper[key] = { ...o, permsn_nm: { [o.permsn_nm]: false } };
        r.push(helper[key]);
      } else {
        helper[key].permsn_nm = {
          ...helper[key].permsn_nm,
          [o.permsn_nm]: false,
        };
      }
      return r;
    }, []);
  };
  const fetchPermissions = async () => {
    const permissionsData = await getPolicyPermissions();
    const filteredData = filterPermission(permissionsData);
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
    console.log("updateData", newArr);
    setPermissions(newArr);
  };
  useEffect(() => {
    fetchPermissions();
  }, [products]);
  useEffect(() => {
    getProducts();
  }, []);
  return (
    <div className="create-policy-wrapper">
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
                onClick: submitPolicy,
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
                New Policy
              </Typography>
              <br />
              <TextField
                id="policyName"
                size="small"
                label="Policy Name"
                placeholder="Name your policy"
                onChange={handleChange}
              />
              <TextField
                id="policyDesc"
                size="small"
                label="Policy Description"
                placeholder="Describe your policy"
                rows="18"
                multiline={true}
                minHeight={150}
                sizeAdjustable
                onChange={handleChange}
              />
            </div>
          </Box>
        </Grid>
        <Grid item xs={9} className="products-wrapper">
          <br />
          <Tabs value={currentTab} onChange={handleChangeTab} truncate>
            {products &&
              products.map((product, i) => {
                return <Tab label={product.prod_nm} />;
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

export default CreatePolicy;
