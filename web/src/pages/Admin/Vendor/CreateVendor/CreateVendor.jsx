/* eslint-disable react/button-has-type */
import React, { useContext, useEffect, useState } from "react";
import Box from "apollo-react/components/Box";
import { useHistory } from "react-router";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Switch from "apollo-react/components/Switch";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import TextField from "apollo-react/components/TextField";
import Select from "apollo-react/components/Select";
import "./CreateVendor.scss";
import Typography from "apollo-react/components/Typography";
import Grid from "apollo-react/components/Grid";
import MenuItem from "apollo-react/components/MenuItem";
import {
  addVendorService,
  getVendorDetails,
} from "../../../../services/ApiServices";
import { MessageContext } from "../../../../components/Providers/MessageProvider";
import ContactsTable from "./ContactsTable";
import { getUserInfo, inputAlphaNumeric } from "../../../../utils";

const breadcrumpItems = [
  { href: "/" },
  {
    title: "Vendors",
    href: "/vendor/list",
  },
  {
    title: "Create New Vendor",
  },
];

const CreateVendor = () => {
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [vName, setVName] = useState("");
  const [vDescription, setVDescription] = useState("");
  const [vESN, setVESN] = useState("");
  const [vContacts, setVContacts] = useState({});
  const [products, setProducts] = useState([]);
  const messageContext = useContext(MessageContext);
  const userInfo = getUserInfo();
  const history = useHistory();
  const handleActive = (e, checked) => {
    setActive(checked);
  };
  // eslint-disable-next-line consistent-return
  const submitVendor = async () => {
    const reqBody = {
      vName,
      vDescription,
      vESN,
      vContacts,
      userId: userInfo.user_id,
      vStatus: active ? "Active" : "Inactive",
    };
    if (vName === "") {
      messageContext.showErrorMessage("Vendor Name shouldn't be empty");
      return false;
    }
    let atleastOneSelected = false;
    if (active) {
      Object.keys(vContacts).forEach((product) => {
        vContacts[product].every((category) => {
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
    addVendorService(reqBody)
      .then((res) => {
        messageContext.showSuccessMessage(res.message || "Successfully Done");
        history.push("/vendor/list");
        setLoading(false);
      })
      .catch((err) => {
        messageContext.showErrorMessage(err.message || "Something went wrong");
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (e.target.id === "vName") {
      inputAlphaNumeric(e, (v) => {
        setVName(v);
      });
    } else if (e.target.id === "vDescription") {
      setVDescription(val);
    }
  };

  const updateData = (childData) => {
    const newArr = { ...vContacts, [childData.product]: childData.data };
    console.log("updateData", newArr);
    setVContacts(newArr);
  };

  const options = ["None", "CDR", "GDMPM-DAS", "IQB", "TDSE", "Wingspan"];

  const handleSelection = (e) => {
    // console.log(e);
    setVESN(e.target.value);
  };

  return (
    <div className="create-vendor-wrapper">
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
                onClick: () => history.push("/vendor/list"),
              },
              {
                label: "Save",
                size: "small",
                disabled: loading,
                onClick: submitVendor,
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
                New Vendor
              </Typography>
              <br />
              <TextField
                id="vName"
                size="small"
                label="Vendor Name"
                placeholder="Name your vendor"
                onChange={handleChange}
              />
              <Select
                size="small"
                fullWidth
                label="External System Name"
                placeholder="Select system name"
                canDeselect={false}
                value={vESN}
                onChange={(e) => handleSelection(e)}
              >
                {options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                id="vDescription"
                size="small"
                label="Vendor Description"
                placeholder="Describe your vendor"
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
          <div className="product-content">
            <ContactsTable
              messageContext={messageContext}
              title="CDAS Admin"
              updateData={updateData}
              data={[]}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default CreateVendor;
