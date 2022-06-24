/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-useless-escape */

import React, { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useLocation, useParams } from "react-router-dom";
import ApolloProgress from "apollo-react/components/ApolloProgress";
import Tooltip from "apollo-react/components/Tooltip";
import EmailIcon from "apollo-react-icons/Email";
import Button from "apollo-react/components/Button";

import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Switch from "apollo-react/components/Switch";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import TextField from "apollo-react/components/TextField";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import SearchIcon from "apollo-react-icons/Search";
import "./UpdateUser.scss";
import Typography from "apollo-react/components/Typography";
import Link from "apollo-react/components/Link";
import Grid from "apollo-react/components/Grid";
import Modal from "apollo-react/components/Modal";
import Tag from "apollo-react/components/Tag";

import {
  validateEmail,
  inviteExternalUser,
  fetchADUsers,
  inviteInternalUser,
  getUser,
  updateUserStatus,
} from "../../../services/ApiServices";
import { debounceFunction } from "../../../utils";
import usePermission, {
  Categories,
  Features,
} from "../../../components/Common/usePermission";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import {
  formComponentActive,
  hideAlert,
  showAppSwitcher,
} from "../../../store/actions/AlertActions";
import AlertBox from "../../AlertBox/AlertBox";
import UserAssignmentTable from "./UpdateAssignmentTable";

const userListURL = "/user-management";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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
    <span
      className="value flex"
      variant="body2"
      style={{ wordWrap: "break-word", fontWeight: "bold" }}
    >
      {children}
    </span>
  );
};

const ConfirmModal = React.memo(({ open, cancel, stayHere, loading }) => {
  return (
    <Modal
      open={open}
      onClose={stayHere}
      className="save-confirm"
      disableBackdropClick="true"
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

const InviteUserModal = ({ open, onSendInvite, stayHere, loading, email }) => {
  return (
    <Modal
      open={open}
      onClose={stayHere}
      className="save-confirm"
      disableBackdropClick="true"
      title="Invite User?"
      id="neutral"
      buttonProps={[
        { label: "Change email", disabled: loading },
        { label: "Email invitation", onClick: onSendInvite, disabled: loading },
      ]}
    >
      <Typography gutterBottom>
        This new user will be sent an email invitation.
        <br />
        Please double check the email address.
      </Typography>
      <Typography gutterTop>
        <div className="flex justify-center flex-center">
          <span className="b-font">{email}</span>
        </div>
      </Typography>
    </Modal>
  );
};

const AddUser = () => {
  const toast = useContext(MessageContext);
  const dispatch = useDispatch();
  const history = useHistory();
  const { id: userId } = useParams();

  const alertStore = useSelector((state) => state.Alert);
  const { canRead, canCreate, canUpdate, readOnly } = usePermission(
    Categories.MENU,
    Features.USER_MANAGEMENT
  );

  const [active, setActive] = useState(true);
  const [disableSave, setDisableSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [isAnyUpdate, setIsAnyUpdate] = useState(false);
  const [isShowAlertBox, setShowAlertBox] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [breadcrumpItems, setBreadcrumpItems] = useState([]);
  const [showRolePopup, setShowRolePopup] = useState(false);

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
    if (alertStore?.showAlertBox) {
      setShowAlertBox(true);
    }
  }, [alertStore]);

  const updateChanges = () => {
    if (!isAnyUpdate) {
      setIsAnyUpdate(true);
    }
  };
  const checkUserTypeAndUpdate = (checked) => {
    const userType = targetUser.usr_typ;
    const payload = {
      tenant_id: targetUser.tenant_id,
      user_type: targetUser.usr_typ,
      email_id: targetUser.usr_mail_id,
      user_id: targetUser.usr_id,
      changed_to: checked ? "active" : "inactive",
    };
    updateUserStatus(payload);
    // updateUserStatus(userId, "In Active");
    // setShowRolePopup(true);
  };
  const handleActive = (e, checked) => {
    setActive(checked);
    updateChanges();
    checkUserTypeAndUpdate(checked);
    setTargetUser({
      ...targetUser,
      usr_stat: checked ? "Active" : "In Active",
    });
  };
  const cancelEdit = () => {
    // unbFckRouter();
    setConfirm(false);
    history.push(userListURL);
  };

  const stayHere = () => {
    setConfirm(false);
  };

  const goToUser = (e) => {
    e.preventDefault();
    history.push("/user-management/");
  };

  const updateBreadcrump = (usr) => {
    const breadcrumpArr = [
      { href: "", onClick: () => history.push("/launchpad") },
      {
        title: "User Management",
        onClick: () => history.push(userListURL),
      },
      {
        title: `${usr.usr_fst_nm} ${usr.usr_lst_nm}`,
      },
    ];
    setBreadcrumpItems(breadcrumpArr);
  };

  useEffect(() => {
    dispatch(formComponentActive());
    (async () => {
      const userRes = await getUser(userId);
      setTargetUser(userRes);
      updateBreadcrump(userRes);
      setActive(userRes.usr_stat === "Active" ? true : false);
    })();
  }, []);

  function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours %= 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    const strTime = `${hours}:${minutes} ${ampm}`;
    return strTime;
  }

  const getExpirationDate = () => {
    const inviteDate = new Date(targetUser?.invt_sent_tm);
    inviteDate.setDate(inviteDate.getDate() + 3);
    return inviteDate;
  };

  const getExpirationDateString = () => {
    const expiryDate = getExpirationDate();
    const year = expiryDate.getFullYear(); // 2019
    const date = expiryDate.getDate(); // 23
    const month = monthNames[expiryDate.getMonth()];
    const time = formatAMPM(expiryDate);
    const dateString = `${time}, ${date} ${month}, ${year}`;
    return dateString;
  };

  const isInvitationExpired = () => {
    if (getExpirationDate() < new Date()) {
      return true;
    }
    return false;
  };

  const isUserInvited = () => {
    const userStatus = targetUser?.usr_stat;
    return userStatus?.trim()?.toLowerCase() === "invited" ? true : false;
  };

  return (
    <div className="create-user-wrapper">
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
      <div className="paper">
        <Box className="top-content">
          {breadcrumpItems.length && (
            <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
          )}
          <Typography variant="title1" className="b-font title">
            {`${targetUser?.usr_fst_nm} ${targetUser?.usr_lst_nm}`}
          </Typography>
          <div className="flex justify-space-between">
            <Link onClick={(e) => goToUser(e)}>
              {"< Back to User Management List"}
            </Link>
            {!readOnly && targetUser?.usr_stat !== "Invited" ? (
              <Switch
                label="Active"
                className="inline-checkbox"
                checked={active}
                onChange={handleActive}
                size="small"
              />
            ) : (
              <Tag
                className="user-tag-capitalized"
                label={`Status: ${targetUser?.usr_stat}`}
                variant="purple"
              />
            )}
          </div>
        </Box>
      </div>
      <div className="padded">
        <Grid container spacing={2}>
          {/* {console.log("save", disableSave)} */}
          <Grid item xs={3}>
            <Box>
              <div className="flex create-sidebar flexWrap">
                <Typography className="user-update-label">
                  Name
                  <div className="ml-3">
                    <div className="user-update-font-500">
                      {`${targetUser?.usr_fst_nm} ${targetUser?.usr_lst_nm}`}
                    </div>
                  </div>
                </Typography>
                <Typography className="mt-4 user-update-label">
                  Email address
                  <div className="ml-3">
                    <div className="user-update-font-500 mt-2">
                      {targetUser?.usr_mail_id}
                    </div>
                    {isUserInvited() && (
                      <>
                        <div className="light mt-2">
                          {isInvitationExpired()
                            ? "Invitation expired:"
                            : "Invitation sent, not yet activated Expires"}
                        </div>
                        <div className="light mt-2">
                          {getExpirationDateString()}
                        </div>
                        <div className="mt-2">
                          <Button
                            variant="secondary"
                            icon={<EmailIcon />}
                            size="small"
                          >
                            Resend Invitation
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </Typography>
                <Typography className="mt-4 user-update-label">
                  Employee ID
                  <div className="ml-3">
                    <div className="user-update-font-500">
                      {targetUser?.usr_id}
                    </div>
                  </div>
                </Typography>
              </div>
            </Box>
          </Grid>
          <Grid item xs={9} className="contacts-wrapper">
            <div className="study-table">
              <UserAssignmentTable
                userId={userId}
                targetUser={targetUser}
                updateChanges={updateChanges}
                showRolePopup={showRolePopup}
                setShowRolePopup={setShowRolePopup}
              />
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default AddUser;
