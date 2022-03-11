/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/button-has-type */
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "apollo-react/components/Box";
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
  updateVendorService,
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

const ConfirmModal = React.memo(({ open, cancel, stayHere, loading }) => {
  return (
    <Modal
      open={open}
      onClose={stayHere}
      className="save-confirm"
      variant="warning"
      title="Lose your work?"
      message="Your unsaved changes will be lost. Are you sure you want to leave this page?"
      buttonProps={[
        { label: "Leave without saving", onClick: cancel, disabled: loading },
        {
          label: "Stay on this page",
          onClick: stayHere,
          disabled: loading,
        },
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
  const [vESN, setVESN] = useState("");
  const [vId, setVId] = useState("");
  const [vContacts, setVContacts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const messageContext = useContext(MessageContext);
  const userInfo = getUserInfo();
  const history = useHistory();
  const params = useParams();
  const dispatch = useDispatch();
  const vendor = useSelector((state) => state.vendor);
  const { isEditPage, isCreatePage, selectedVendor, ensList } = vendor;

  useEffect(() => {});

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
    { href: "/" },
    {
      title: "Vendors",
      href: "/vendor/list",
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
      setVESN(selectedVendor.vESN);
      setVName(selectedVendor.vName);
      setVDescription(selectedVendor.vDescription);
      setActive(selectedVendor.vStatus === 1 ? true : false);
    }
    // console.log("inside update");
  }, [isEditPage, isCreatePage, params]);

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
      vId,
      vName,
      vDescription,
      vESN,
      vContacts,
      userId: userInfo.user_id,
      userName: userInfo.firstName,
      vStatus: active ? 1 : 0,
    };
    if (vName === "") {
      messageContext.showErrorMessage("Vendor Name shouldn't be empty");
      return false;
    }
    if (vESN === "") {
      messageContext.showErrorMessage(
        "Vendor External System Name need to be selected"
      );
      return false;
    }

    setLoading(true);
    if (isCreatePage) {
      addVendorService(reqBody)
        .then((res) => {
          messageContext.showSuccessMessage(res.message || "Successfully Done");
          history.push("/vendor/list");
          setLoading(false);
        })
        .catch((err) => {
          if (err.data) {
            messageContext.showErrorMessage(
              err.data ||
                "vendor name and external system name combination already exists."
            );
          } else {
            messageContext.showErrorMessage(
              err.message || "Something went wrong"
            );
          }
          setLoading(false);
        });
    } else if (isEditPage) {
      updateVendorService(reqBody)
        .then((res) => {
          messageContext.showSuccessMessage(res.message || "Successfully Done");
          history.push("/vendor/list");
          setLoading(false);
        })
        .catch((err) => {
          if (err.data) {
            messageContext.showErrorMessage(
              err.data ||
                "vendor name and external system name combination already exists."
            );
          } else {
            messageContext.showErrorMessage(
              err.message || "Something went wrong"
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
    setConfirm(false);
    history.goBack();
  };

  const stayHere = () => {
    setConfirm(false);
  };

  const handleCancel = () => {
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
      });
    }
  };

  return (
    <div className="create-vendor-wrapper">
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
                  onClick: handleCancel,
                },
                {
                  label: "Save",
                  size: "small",
                  disabled: loading || disableSave,
                  onClick: submitVendor,
                },
              ]}
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
              {/* <br /> */}
              <TextField
                id="vName"
                size="small"
                value={vName}
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
              />
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
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default CreateVendor;
