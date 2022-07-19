/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-useless-escape */

import React, { useEffect, useState, useContext, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useLocation, useParams } from "react-router-dom";
import ApolloProgress from "apollo-react/components/ApolloProgress";
import Tooltip from "apollo-react/components/Tooltip";
import EmailIcon from "apollo-react-icons/Email";
import Button from "apollo-react/components/Button";
import InfoIcon from "apollo-react-icons/Info";
import ChevronLeft from "apollo-react-icons/ChevronLeft";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import * as colors from "apollo-react/colors";
import Switch from "apollo-react/components/Switch";
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
  sendInvite,
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

// const ConfirmModal = React.memo(({ open, cancel, stayHere, loading }) => {
//   return (
//     <Modal
//       open={open}
//       onClose={stayHere}
//       className="save-confirm"
//       disableBackdropClick={true}
//       variant="warning"
//       title="Lose your work?"
//       message="All unsaved changes will be lost."
//       buttonProps={[
//         { label: "Keep editing", disabled: loading },
//         { label: "Leave without saving", onClick: cancel, disabled: loading },
//       ]}
//       id="neutral"
//     />
//   );
// });

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
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inactiveStudyRoles, setInactiveStudyRoles] = useState([]);
  const [showEmailTooTip, setEmailTooTip] = useState(false);
  const [isUpdateInprogress, setIsUpdateInprogress] = useState(false);
  const [openCancelModal, setOpenCancelModal] = useState(false);

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

  const getUserAPI = async () => {
    const userRes = await getUser(userId);
    setTargetUser(userRes);
    updateBreadcrump(userRes);
    setActive(userRes.formatted_stat === "Active" ? true : false);
  };

  const checkUserTypeAndUpdate = async (checked) => {
    setLoading(true);
    const userType = targetUser.usr_typ;
    const payload = {
      tenant_id: targetUser.tenant_id,
      user_type: targetUser.usr_typ?.toLowerCase(),
      email_id: targetUser.usr_mail_id,
      user_id: targetUser.usr_id,
      firstName: targetUser.usr_fst_nm,
      lastName: targetUser.usr_lst_nm,
      employeeId: targetUser.extrnl_emp_id,
      changed_to: checked ? "active" : "inactive",
    };
    const res = await updateUserStatus(payload);
    setInactiveStudyRoles(res?.data);
    await getUserAPI();
    setLoading(false);
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
    if (!isUpdateInprogress) {
      history.push("/user-management/");
    } else {
      setOpenCancelModal(true);
    }
  };

  useEffect(() => {
    dispatch(formComponentActive());
    getUserAPI();
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
    const userStatus = targetUser?.formatted_stat;
    return userStatus?.trim()?.toLowerCase() === "invited" ? true : false;
  };

  const resendInvitation = async () => {
    setIsSendingInvite(true);
    const payload = {
      firstName: targetUser?.usr_fst_nm,
      lastName: targetUser?.usr_lst_nm,
      email: targetUser?.usr_mail_id,
      uid: targetUser?.usr_id,
    };
    try {
      const res = await sendInvite(payload);
      const newTime = res?.data;
      if (newTime) setTargetUser({ ...targetUser, invt_sent_tm: newTime });
    } catch (e) {
      console.log(e);
    }
    setIsSendingInvite(false);
  };

  const closeRolePopup = () => {
    setInactiveStudyRoles([]);
  };

  const getInactiveRolesCount = () => {
    return inactiveStudyRoles?.reduce(
      (acc, study) => acc + study?.inactiveRoles?.length,
      0
    );
  };

  const emailRef = useRef();

  const showEmailToolTip = (action) => {
    if (
      action === "show" &&
      emailRef.current.scrollWidth > emailRef.current.offsetWidth
    ) {
      setEmailTooTip(true);
    } else {
      setEmailTooTip(false);
    }
  };

  const updateInProgress = (flag) => {
    setIsUpdateInprogress(flag);
  };

  return (
    <div className="create-user-wrapper">
      {isShowAlertBox && (
        <AlertBox cancel={keepEditingBtn} submit={leavePageBtn} />
      )}
      {isUpdateInprogress && (
        <Modal
          open={openCancelModal}
          onClose={(e) => setOpenCancelModal(false)}
          className="save-confirm"
          disableBackdropClick={true}
          variant="warning"
          title="Lose your work?"
          message="All unsaved changes will be lost."
          buttonProps={[
            { label: "Keep editing" },
            {
              label: "Leave without saving",
              onClick: () => history.push("/user-management/"),
            },
          ]}
          id="neutral"
        />
      )}

      {/* {isAnyUpdate && (
        <ConfirmModal
          open={confirm}
          cancel={cancelEdit}
          loading={loading}
          stayHere={stayHere}
        />
      )} */}
      <Modal
        open={!!inactiveStudyRoles?.length}
        onClose={closeRolePopup}
        className="save-confirm"
        variant="default"
        title={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <div className="flex flex-center gap-2">
            <InfoIcon style={{ color: colors.blue }} />
            <span className="mt-1">Removed assignments</span>
          </div>
        }
        buttonProps={[
          {
            variant: "primary",
            label: "Dismiss",
            onClick: closeRolePopup,
            disabled: loading,
          },
        ]}
        id="neutral2"
      >
        <div className="px-32">
          <Typography gutterBottom>
            {`${getInactiveRolesCount()} assignments were removed from ${
              inactiveStudyRoles?.length
            } studies as the Roles are now inactive:`}
            <br />
            <Grid container spacing={2}>
              {inactiveStudyRoles?.map(({ studyName, inactiveRoles }) => {
                return (
                  <>
                    <Grid item xs={5}>
                      {studyName}
                    </Grid>
                    <Grid item xs={7}>
                      {inactiveRoles?.map((r) => r.name).join(", ")}
                    </Grid>
                  </>
                );
              })}
            </Grid>
          </Typography>
        </div>
      </Modal>
      <div className="paper">
        <Box className="top-content">
          {breadcrumpItems.length && (
            <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
          )}

          <div className="flex justify-space-between mb-8">
            <Button
              onClick={goToUser}
              className="back-btn"
              icon={<ChevronLeft />}
              size="small"
            >
              Back to User Management List
            </Button>
            {!readOnly && targetUser?.formatted_stat !== "Invited" ? (
              <Switch
                label="Active"
                className="inline-checkbox"
                checked={active}
                disabled={loading}
                onChange={handleActive}
                size="small"
              />
            ) : (
              <Tag
                className="user-tag-capitalized"
                label={`Status: ${targetUser?.formatted_stat}`}
                variant="purple"
              />
            )}
          </div>
          <Typography variant="title1" className="b-font title">
            {`${targetUser?.usr_fst_nm} ${targetUser?.usr_lst_nm}`}
          </Typography>
        </Box>
      </div>
      <div className="padded">
        <Grid container spacing={2}>
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
                    <Tooltip
                      variant="dark"
                      title={targetUser?.usr_mail_id}
                      placement="top"
                      open={showEmailTooTip}
                      style={{ marginRight: 48 }}
                    >
                      <Typography
                        ref={emailRef}
                        onMouseEnter={(e) => showEmailToolTip("show")}
                        onMouseLeave={(e) => showEmailToolTip("hide")}
                        gutterBottom
                        noWrap
                        className={`user-update-font-500 mt-2 ${
                          showEmailTooTip && "cursor-pointer"
                        }`}
                      >
                        {targetUser?.usr_mail_id}
                      </Typography>
                    </Tooltip>
                    {isUserInvited() && (
                      <>
                        <div className="light mt-2">
                          {isInvitationExpired() ? (
                            "Invitation expired:"
                          ) : (
                            // eslint-disable-next-line react/jsx-wrap-multilines
                            <>
                              <div>Invitation sent, not yet activated</div>
                              <span>Expires</span>
                            </>
                          )}
                        </div>
                        <div className="light mt-2">
                          {getExpirationDateString()}
                        </div>
                        {(canCreate || canUpdate) && isInvitationExpired() && (
                          <div className="mt-2">
                            <Button
                              variant="secondary"
                              icon={<EmailIcon />}
                              size="small"
                              onClick={resendInvitation}
                              disabled={isSendingInvite || readOnly}
                            >
                              Resend Invitation
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Typography>
                <Typography className="mt-4 user-update-label">
                  Employee ID
                  <div className="ml-3">
                    <div className="user-update-font-500">
                      {targetUser?.usr_id || targetUser?.extrnl_emp_id}
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
                updateInProgress={updateInProgress}
                showRolePopup={showRolePopup}
                // setShowRolePopup={setShowRolePopup}
                userUpdating={loading}
                readOnly={readOnly}
                canUpdate={canUpdate}
                setParentLoading={setLoading}
              />
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default AddUser;
