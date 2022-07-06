/* eslint-disable no-script-url */
/* eslint-disable react/button-has-type */
import React, { useContext, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import Modal from "apollo-react/components/Modal";
import Badge from "apollo-react/components/Badge";
import moment from "moment";
import {
  addPolicyService,
  fetchProducts,
  getPolicyPermissions,
} from "../../../../services/ApiServices";
import { MessageContext } from "../../../../components/Providers/MessageProvider";
import PermissionTable from "./PermissionTable";
import { getUserInfo, inputAlphaNumeric } from "../../../../utils";
import {
  formComponentActive,
  hideAlert,
  showAppSwitcher,
  formComponentInActive,
  hideAppSwitcher,
} from "../../../../store/actions/AlertActions";
import AlertBox from "../../../AlertBox/AlertBox";

const ConfirmModal = React.memo(({ open, cancel, closeModal, loading }) => {
  return (
    <Modal
      open={open}
      disableBackdropClick={true}
      onClose={closeModal}
      className="save-confirm"
      variant="warning"
      title="Lose your work?"
      message="All unsaved changes will be lost."
      buttonProps={[
        { label: "Keep editing", onClick: closeModal, disabled: loading },
        { label: "Leave without saving", onClick: cancel, disabled: loading },
      ]}
      id="neutral"
    />
  );
});
const CreatePolicy = () => {
  const dispatch = useDispatch();
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [policyName, setPolicyName] = useState("");
  const [policyDesc, setPolicyDesc] = useState("");
  const [permissions, setPermissions] = useState({});
  const [products, setProducts] = useState([]);
  const messageContext = useContext(MessageContext);
  const userInfo = getUserInfo();
  const history = useHistory();
  const routerHandle = useRef();
  const [targetRoute, setTargetRoute] = useState("");
  const alertStore = useSelector((state) => state.Alert);
  const [isShowAlertBox, setShowAlertBox] = useState(false);

  const unblockRouter = () => {
    dispatch(formComponentInActive());
    dispatch(hideAlert());
    dispatch(hideAppSwitcher());
    if (routerHandle) {
      routerHandle.current();
    }
  };
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
      title: "Create New Policy",
    },
  ];
  // eslint-disable-next-line consistent-return
  const submitPolicy = async () => {
    const reqBody = {
      policyName,
      policyDesc,
      permissions,
      userId: userInfo.user_id,
      status: active ? "Active" : "Inactive",
      created_on: new Date().toISOString(),
      updated_on: new Date().toISOString(),
    };
    if (policyName === "") {
      messageContext.showErrorMessage("Policy name shouldn't be empty");
      return false;
    }
    if (policyName.length > 255) {
      messageContext.showErrorMessage(
        "Policy name should not allowed to save with more than 255 characters. Max length is 255"
      );
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
        messageContext.showSuccessMessage(res.message || "Successfully done");
        unblockRouter();
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
  const cancelCreate = () => {
    unblockRouter();
    if (targetRoute === "") {
      history.push("/policy-management");
    } else {
      history.push(targetRoute);
    }
  };
  const filterPermission = (arr) => {
    if (!arr) return [];
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
    if (productsData) setProducts(productsData);
  };
  const updateData = (childData) => {
    const newArr = { ...permissions, [childData.product]: childData.data };
    setPermissions(newArr);
  };
  const getBadgeCount = (product) => {
    if (!permissions[product]) {
      return 0;
    }
    return permissions[product].filter((category) => {
      return Object.keys(category.permsn_nm).find((x) => {
        return category.permsn_nm[x] === true;
      });
    }).length;
  };
  const closeModal = () => setConfirm(false);
  useEffect(() => {
    fetchPermissions();
  }, [products]);
  useEffect(() => {
    getProducts();
  }, []);

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
      setTargetRoute(tr?.pathname);
      setConfirm(true);
      return false;
    });

    return function () {
      /* eslint-disable */
      routerHandle.current()
    };
  });
  return (
    <div className="create-policy-wrapper">
      {isShowAlertBox && (
        <AlertBox cancel={keepEditingBtn} submit={leavePageBtn} />
      )}
      <ConfirmModal
        open={confirm}
        cancel={cancelCreate}
        loading={loading}
        closeModal={closeModal}
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
          <ButtonGroup
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
                inputProps={{
                  maxLength: 255,
                }}
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
                    key={product.prod_id}
                    disabled={product.active_product === 0}
                    label={
                      // eslint-disable-next-line react/jsx-wrap-multilines
                      <Badge
                        badgeContent={getBadgeCount(product.prod_nm)}
                        max={999}
                      >
                        {product.prod_nm === "Admin"
                          ? "CDAS Admin"
                          : product.prod_nm}
                      </Badge>
                    }
                  />
                );
              })}
          </Tabs>
          <div className="product-content">
            {products &&
              products.map((product, i) => {
                if (currentTab !== i || product.active_product === 0) {
                  return false;
                }
                return (
                  <PermissionTable
                    key={product.prod_id}
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
