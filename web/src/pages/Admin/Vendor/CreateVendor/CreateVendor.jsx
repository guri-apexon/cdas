/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/button-has-type */
import React, { useContext, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Switch from "apollo-react/components/Switch";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import TextField from "apollo-react/components/TextField";
import Select from "apollo-react/components/Select";
import "./CreateVendor.scss";
import Typography from "apollo-react/components/Typography";
import Link from "apollo-react/components/Link";
import Grid from "apollo-react/components/Grid";
import MenuItem from "apollo-react/components/MenuItem";
import Modal from "apollo-react/components/Modal";
import _ from "lodash";
import {
  addVendorService,
  deleteVendorContact,
} from "../../../../services/ApiServices";
import {
  selectVendor,
  getENSList,
} from "../../../../store/actions/VendorAction";
import { MessageContext } from "../../../../components/Providers/MessageProvider";
// import ContactsTable from "./ContactsTable";
import TableEditableAll from "./ContactTable";
import {
  getUserInfo,
  inputAlphaNumericWithUnderScore,
} from "../../../../utils";
import usePermission, {
  Categories,
  Features,
} from "../../../../components/Common/usePermission";
import {
  formComponentActive,
  hideAlert,
  showAppSwitcher,
  formComponentInActive,
  hideAppSwitcher,
} from "../../../../store/actions/AlertActions";
import AlertBox from "../../../AlertBox/AlertBox";

const Box = ({ children }) => {
  return (
    <span className="label" variant="body2">
      {children}
    </span>
  );
};

const Label = ({ children }) => {
  return (
    <span className="label" style={{ color: "gray" }}>
      {children}
    </span>
  );
};
const Value = ({ children }) => {
  return (
    <div
      className="value"
      variant="body2"
      style={{ "word-wrap": "break-word", fontWeight: "bold" }}
    >
      {children}
    </div>
  );
};

const ConfirmModal = React.memo(({ open, cancel, stayHere, loading }) => {
  return (
    <Modal
      open={open}
      onClose={stayHere}
      className="save-confirm"
      disableBackdropClick={true}
      variant="warning"
      title="Lose your work?"
      message="All unsaved changes will be lost."
      buttonProps={[
        { label: "Keep editing", disabled: loading },
        { label: "Leave without saving", onClick: cancel, disabled: loading },
      ]}
      id="neutral"
    />
  );
});

const CreateVendor = () => {
  const [active, setActive] = useState(true);
  const [disableSave, setDisableSave] = useState(false);
  const [isAnyUpdate, setIsAnyUpdate] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vName, setVName] = useState("");
  const [vDescription, setVDescription] = useState("");
  const [vESName, setVESN] = useState("");
  const [vId, setVId] = useState("");
  const [vContacts, setVContacts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [initialRender, setInitialRender] = useState(true);
  const messageContext = useContext(MessageContext);
  const userInfo = getUserInfo();
  const history = useHistory();
  const params = useParams();
  const dispatch = useDispatch();
  const vendor = useSelector((state) => state.vendor);
  const [targetRoute, setTargetRoute] = useState("");
  const { isEditPage, isCreatePage, selectedVendor, ensList } = vendor;
  const [canEditFields, setCanEditFields] = useState(false);
  const { canRead, canCreate, canUpdate, readOnly } = usePermission(
    Categories.SYS_ADMIN,
    Features.VENDOR_MANAGEMENT
  );

  const alertStore = useSelector((state) => state.Alert);
  const [isShowAlertBox, setShowAlertBox] = useState(false);

  const routerHandle = useRef();
  const unblockRouter = () => {
    dispatch(formComponentInActive());
    dispatch(hideAlert());
    dispatch(hideAppSwitcher());
    if (routerHandle) {
      routerHandle.current();
    }
  };

  useEffect(() => {
    if (params.id) {
      dispatch(selectVendor(params.id));
    }
  }, [params]);
  useEffect(() => {
    if (ensList.length <= 1) {
      dispatch(getENSList());
    }
  }, []);

  const breadcrumpItems = [
    { href: "", onClick: () => history.push("/launchpad") },
    {
      title: "Vendors",
      onClick: () => history.push("/vendor/list"),
    },
    {
      title: isEditPage ? vName : "Create New Vendor",
    },
  ];

  useEffect(() => {
    if (isCreatePage) {
      setVId("");
      setVESN("");
      setVName("");
      setVDescription("");
      setActive(true);
    } else if (isEditPage) {
      setVId(selectedVendor.vId);
      setVESN(selectedVendor.vESName ? selectedVendor.vESName : "");
      setVName(selectedVendor.vName);
      setVDescription(
        selectedVendor.vDescription ? selectedVendor.vDescription : ""
      );
      setActive(selectedVendor.vStatus === 1 ? true : false);
    }
    // console.log("inside update");
  }, [isEditPage, isCreatePage, params]);

  useEffect(() => {
    if (params.id) {
      setCanEditFields(canUpdate);
    } else {
      setCanEditFields(canCreate);
    }
  }, [canUpdate, canCreate]);

  const updateChanges = () => {
    if (!isAnyUpdate) {
      setIsAnyUpdate(true);
    }
  };

  const handleActive = (e, checked) => {
    setActive(checked);
    updateChanges();
  };
  // eslint-disable-next-line consistent-return
  const submitVendor = async () => {
    const reqBody = {
      systemName: "CDI",
      vId,
      vName,
      vDescription,
      vESName,
      vContacts,
      userId: userInfo.user_id,
      vStatus: active ? 1 : 0,
      insrt_tm: new Date().toISOString(),
    };
    setInitialRender(false);
    if (vName === "") {
      messageContext.showErrorMessage("Vendor name shouldn't be empty");
      return false;
    }
    if (vESName === "") {
      messageContext.showErrorMessage(
        "Vendor external system name need to be selected"
      );
      return false;
    }

    setLoading(true);
    if (isCreatePage || isEditPage) {
      // eslint-disable-next-line
      addVendorService(reqBody)
        .then((res) => {
          messageContext.showSuccessMessage(res.message || "Successfully done");
          unblockRouter();
          history.push("/vendor/list");
          setLoading(false);
        })
        .catch((err) => {
          if (err?.data) {
            messageContext.showErrorMessage(
              err?.data ||
                "Vendor name and external system name combination already exists."
            );
          } else {
            messageContext.showErrorMessage(
              err?.message || "Something went wrong"
            );
          }
          setLoading(false);
        });
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    updateChanges();
    if (e.target.id === "vName") {
      inputAlphaNumericWithUnderScore(e, (v) => {
        setVName(v);
      });
    } else if (e.target.id === "vDescription") {
      setVDescription(val);
    }
  };

  const updateData = async (data) => {
    const goodContacts = await data.map((e) => {
      const newData = _.omit(e, ["isEmailValid", "isNameValid", "isStarted"]);
      newData.status = 1;
      return newData;
    });
    // console.log("updateData", data, goodContacts);
    setContacts(data);
    setVContacts(goodContacts);
    updateChanges();
  };

  useEffect(() => {
    if (contacts.length > 1) {
      const email = contacts.map((e) => e.isEmailValid);
      const name = contacts.map((e) => e.isNameValid);
      // const started = contacts.map((e) => e.isStarted);
      const isValid = (currentValue) => currentValue === true;
      if (!(email.every(isValid) && name.every(isValid))) {
        setDisableSave(true);
      } else {
        setDisableSave(false);
      }
    } else {
      setDisableSave(false);
    }
  }, [contacts]);
  const vENSOptions = [...ensList];
  const handleSelection = (e) => {
    setVESN(e.target.value);
    updateChanges();
  };

  const cancelEdit = () => {
    unblockRouter();
    setConfirm(false);
    if (targetRoute === "") {
      history.push("/vendor/list");
    } else {
      history.push(targetRoute);
    }
  };

  const stayHere = () => {
    setConfirm(false);
  };

  const handleCancel = () => {
    unblockRouter();
    if (isAnyUpdate) {
      setConfirm(true);
    } else {
      history.push("/vendor/list");
    }
  };

  const deleteAContact = (vCId) => {
    if (isEditPage) {
      deleteVendorContact({
        vId,
        vCId,
        userName: userInfo.firstName,
        userId: userInfo.user_id,
        updt_tm: new Date().toISOString(),
      });
    }
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
      setTargetRoute(tr?.pathname);
      setIsAnyUpdate(true);
      setConfirm(true);

      return false;
    });

    return function () {
      /* eslint-disable */
      routerHandle.current();
    };
  });

  return (
    <div className="create-vendor-wrapper">
      {isShowAlertBox && (
        <AlertBox cancel={keepEditingBtn} submit={leavePageBtn} />
      )}
      {isAnyUpdate && (
        <ConfirmModal
          open={confirm}
          cancel={cancelEdit}
          loading={loading}
          stayHere={stayHere}
        />
      )}
      <Box className="top-content">
        <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
        <div className="flex full-cover">
          <div>
            <span style={{ marginBottom: 16 }}>
              <Link onClick={handleCancel} size="small">
                &#x276E; Back to Vendor List
              </Link>
            </span>
          </div>
          <div className="flex top-actions">
            {canEditFields && (
              <Switch
                label="Active"
                className="inline-checkbox"
                checked={active}
                onChange={handleActive}
                size="small"
              />
            )}
            <ButtonGroup
              alignItems="right"
              buttonProps={
                !canEditFields
                  ? [
                      {
                        label: "Cancel",
                        size: "small",
                        onClick: handleCancel,
                        hidden: true,
                      },
                    ]
                  : [
                      {
                        label: "Cancel",
                        size: "small",
                        onClick: handleCancel,
                        hidden: true,
                      },
                      {
                        label: "Save",
                        size: "small",
                        disabled: loading || disableSave,
                        onClick: submitVendor,
                      },
                    ]
              }
            />
          </div>
        </div>
      </Box>
      <Grid container spacing={2}>
        {/* {console.log("save", disableSave)} */}
        <Grid item xs={3}>
          <Box>
            <div className="flex create-sidebar flexWrap">
              <Typography variant="title1" className="b-font title">
                {isEditPage ? vName : "New Vendor"}
              </Typography>
              <br />
              {!canEditFields ? (
                <>
                  <Typography>
                    <Label>Vendor Name</Label>
                    <Value>{vName}</Value>
                    <br />
                    <Label>External System Name</Label>
                    <Value>{vESName || ""}</Value>
                    <br />
                    <Label>Description</Label>
                    <Value>{vDescription}</Value>
                  </Typography>
                </>
              ) : (
                <>
                  <TextField
                    id="vName"
                    size="small"
                    value={vName}
                    label="Vendor Name"
                    placeholder="Name your vendor"
                    onChange={handleChange}
                    error={initialRender === false && !vName ? true : false}
                    disabled={!canEditFields}
                  />
                  <Select
                    size="small"
                    fullWidth
                    label="External System Name"
                    placeholder="Select system name"
                    value={vESName || ""}
                    canDeselect={false}
                    onChange={(e) => handleSelection(e)}
                    error={initialRender === false && !vESName ? true : false}
                    disabled={!canEditFields}
                  >
                    {vENSOptions.map((option) => (
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
                    value={vDescription}
                    multiline={true}
                    minHeight={150}
                    sizeAdjustable
                    onChange={handleChange}
                    disabled={!canEditFields}
                  />
                </>
              )}
            </div>
          </Box>
        </Grid>
        <Grid item xs={9} className="contacts-wrapper">
          <br />
          <div className="contact-content">
            {/* <ContactsTable /> */}
            <TableEditableAll
              deleteAContact={deleteAContact}
              updateData={updateData}
              disabled={!canEditFields}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default CreateVendor;
