/* eslint-disable react/button-has-type */
import React, { useContext, useEffect, useState } from "react";
import Box from "apollo-react/components/Box";
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
  getPolicyPermissions,
} from "../../../services/ApiServices";
import { MessageContext } from "../../../components/MessageProvider";

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
  const [currentTab, setCurrentTab] = useState(0);
  const [policyName, setPolicyName] = useState("");
  const [policyDesc, setPolicyDesc] = useState("");
  const [permissions, setPermissions] = useState([]);
  const messageContext = useContext(MessageContext);
  const handleActive = (e, checked) => {
    setActive(checked);
  };
  const handleChangeTab = (event, v) => {
    setCurrentTab(v);
  };
  // eslint-disable-next-line consistent-return
  const submitPolicy = () => {
    const reqBody = {
      policyName,
      policyDesc,
    };
    if (policyName === "") {
      messageContext.showErrorMessage("Policy Name shouldn't be empty");
      return false;
    }
    console.log("submitPolicy", reqBody);
    addPolicyService(reqBody);
  };
  const handleChange = (e) => {
    const val = e.target.value;
    if (e.target.id === "policyName") {
      setPolicyName(val);
    } else if (e.target.id === "policyDesc") {
      setPolicyDesc(val);
    }
  };
  const fetchPermissions = async () => {
    const permissionsData = await getPolicyPermissions();
    console.log("permissions", permissionsData);
    setPermissions(permissionsData);
  };
  useEffect(() => {
    fetchPermissions();
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
                // onClick: () => (),
              },
              {
                label: "Save",
                size: "small",
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
            <Tab label="CDAS Admin" />
            <Tab label="Ingestion" />
            <Tab label="Mapping" />
            <Tab label="Review" />
            <Tab label="Analytics" />
          </Tabs>
          <div className="product-content">
            {currentTab === 0 && (
              <Typography variant="body2">Tab one content</Typography>
            )}
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default CreatePolicy;
