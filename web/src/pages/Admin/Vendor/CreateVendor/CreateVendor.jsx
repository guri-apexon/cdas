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
  getVendorDetails,
} from "../../../../services/ApiServices";
import { selectVendor } from "../../../../store/actions/VendorAdminAction";
import { MessageContext } from "../../../../components/Providers/MessageProvider";
// import ContactsTable from "./ContactsTable";
import TableEditableAll from "./ContactTable";
import {
  getUserInfo,
  inputAlphaNumericWithUnderScore,
} from "../../../../utils";

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
  const [isAnyUpdate, setIsAnyUpdate] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vName, setVName] = useState("");
  const [vDescription, setVDescription] = useState("");
  const [vESN, setVESN] = useState("");
  const [vId, setVId] = useState();
  const [vContacts, setVContacts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [sendContacts, setSendContacts] = useState([]);
  const messageContext = useContext(MessageContext);
  const userInfo = getUserInfo();
  const history = useHistory();
  const params = useParams();
  const dispatch = useDispatch();
  const vendor = useSelector((state) => state.vendor);
  const { isDBData, selectedVendor, selectedContacts } = vendor;

  useEffect(() => {
    if (params.id) {
      dispatch(selectVendor(params.id));
    }
  }, [params]);

  useEffect(() => {
    if (isDBData) {
      // console.log("inside inner update");
      setVId(selectedVendor.vId);
      setVESN(selectedVendor.vESN);
      setVName(selectedVendor.vName);
      setVDescription(selectedVendor.vDescription);
      setActive(selectedVendor.vStatus === 1 ? true : false);
    }
    // console.log("inside update");
  }, [isDBData]);

  // getVendorDetails(params.id).then((res) => {
  //   // console.log(res.vendor);
  //   if (res.vendor) {
  //     // eslint-disable-next-line no-shadow
  //     const { vDescription, vESN, vName, vStatus, vId } = res.vendor;
  //     setActive(vStatus === 1 ? true : false);

  //     // console.log("existing data", vId, vName, vDescription);
  //     setVDescription(vDescription);
  //     setVESN(vESN);
  //     setVName(vName);
  //     setVId(vId);
  //     if (res.contacts) {
  //       setSendContacts(res.contacts);
  //     }
  //   } else {
  //     history.push("/vendor/list");
  //   }
  // });

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
      vName,
      vDescription,
      vESN,
      vContacts,
      userId: userInfo.user_id,
      userName: userInfo.fullName,
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

    // const startList = contacts.map((e) => e.isStarted);
    // const nameValid = contacts.map((e) => e.isNameValid);
    // const emailValid = contacts.map((e) => e.isEmailValid);

    // if (startList.every((v) => v === true)) {
    //   if (nameValid.every((v) => v === true)) {
    //     if (emailValid.every((v) => v === true)) {
    //       const test = "";
    //     }
    //   }
    // }

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
      return newData;
    });
    // console.log("updateData", data, goodContacts);
    setContacts(data);
    setVContacts(goodContacts);
    updateChanges();
  };

  const options = ["None", "CDR", "GDMPM-DAS", "IQB", "TDSE", "Wingspan"];

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
                  disabled: loading,
                  onClick: submitVendor,
                },
              ]}
            />
          </div>
        </div>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Box>
            <div className="flex create-sidebar flexWrap">
              <Typography variant="title1" className="b-font title">
                New Vendor
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
            <TableEditableAll updateData={updateData} />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default CreateVendor;
