/* eslint-disable react/button-has-type */
import React, { useContext, useEffect, useState } from "react";
import Box from "apollo-react/components/Box";
import { useHistory } from "react-router";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Switch from "apollo-react/components/Switch";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import TextField from "apollo-react/components/TextField";
import "./CreateVendor.scss";
import Typography from "apollo-react/components/Typography";
import Grid from "apollo-react/components/Grid";
import {
  addVendorService,
  fetchProducts,
  getVendorDetails,
} from "../../../../services/ApiServices";
import { MessageContext } from "../../../../components/Providers/MessageProvider";
import ContactsTable from "./ContactsTable";
import { getUserInfo, inputAlphaNumeric } from "../../../../utils";

const breadcrumpItems = [
  { href: "/" },
  {
    title: "Vendors",
    href: "/vendor-management",
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
      status: active ? "Active" : "Inactive",
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
        history.push("/vendor-management");
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
    const vContactsData = await getVendorDetails();
    const filteredData = filterPermission(vContactsData);
    const permissionArr = {};
    products.forEach((product) => {
      const filtered = filteredData.filter(
        (x) => x.prod_nm === product.prod_nm
      );
      permissionArr[product.prod_nm] = filtered;
    });
    setVContacts(permissionArr);
  };
  const getProducts = async () => {
    const productsData = await fetchProducts();
    setProducts(productsData);
  };
  const updateData = (childData) => {
    const newArr = { ...vContacts, [childData.product]: childData.data };
    console.log("updateData", newArr);
    setVContacts(newArr);
  };
  const getBadgeCount = (product) => {
    let count = 0;
    if (!vContacts[product]) {
      return count;
    }
    vContacts[product].forEach((category) => {
      count += Object.keys(category.permsn_nm).filter((x) => {
        return category.permsn_nm[x] === true;
      }).length;
    });
    return count;
  };
  useEffect(() => {
    fetchPermissions();
  }, [products]);
  useEffect(() => {
    getProducts();
  }, []);
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
                onClick: () => history.push("/vendor-management"),
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
