/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-useless-escape */

import React, { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useLocation } from "react-router-dom";
import ApolloProgress from "apollo-react/components/ApolloProgress";
import Tooltip from "apollo-react/components/Tooltip";

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

const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

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
  const location = useLocation();
  const { pathname } = location;
  const userId = pathname.slice(1).split("/")[1];
  const user = useSelector((state) => state.user);
  const alertStore = useSelector((state) => state.Alert);
  const { canRead, canCreate, canUpdate, readOnly } = usePermission(
    Categories.MENU,
    Features.USER_MANAGEMENT
  );
  const { isEditPage, isCreatePage, selectedVendor, ensList } = user;

  const [active, setActive] = useState(true);
  const [disableSave, setDisableSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [isAnyUpdate, setIsAnyUpdate] = useState(false);
  const [isShowAlertBox, setShowAlertBox] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserError, setSelectedUserError] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [userList, setUserList] = useState([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [pingParent, setPingParent] = useState(0);
  const [studiesRows, setStudiesRows] = useState();
  const [fetchStatus, setFetchStatus] = useState("success");
  const [confirmInviteUser, setConfirmInviteUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkUserAssignmentTableData, setCheckUserAssignmentTableData] =
    useState();
  const [showToolTip, setShowToolTip] = useState(false);
  const [breadcrumpItems, setBreadcrumpItems] = useState([]);
  const [showRolePopup, setShowRolePopup] = useState(false);
  // const [breadcrumpItems, setBreadcrumpItems] = useState([
  //   { href: "", onClick: () => history.push("/launchpad") },
  //   {
  //     title: "User Management",
  //     onClick: () => history.push(userListURL),
  //   },
  //   {
  //     title: "Test",
  //   },
  // ]);

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
    if (userType === "internal") {
      if (checked) {
        updateUserStatus(userId, "Active");
      } else {
        updateUserStatus(userId, "In Active");
        setShowRolePopup(true);
      }
    } else {
      updateUserStatus(userId, checked ? "Active" : "In Active");
    }
  };
  const handleActive = (e, checked) => {
    setActive(checked);
    updateChanges();
    checkUserTypeAndUpdate(checked);
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

  const handleCancel = () => {
    // unblockRouter();
    if (isAnyUpdate) {
      setConfirm(true);
    } else {
      history.push(userListURL);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    const key = e.target.id;
    updateChanges();
    setSelectedUser({ ...selectedUser, [key]: val });
    // if (key === "usr_fst_nm") {
    //   inputAlphaNumericWithUnderScore(e, (v) => {
    //     setSelectedUser({ ...selectedUser, key: v });
    //   });
    // }
  };

  const getRequiredErrors = (key) => {
    switch (key) {
      case "usr_fst_nm":
        return "First name required";
      case "usr_lst_nm":
        return "Last name required";
      case "usr_mail_id":
        return "Email address required";
      default:
        return "This Field is required";
    }
  };

  const checkEmailExists = async () => {
    const res = await validateEmail(selectedUser.usr_mail_id);
    return res.data.error;
  };

  const validateField = (e, list) => {
    const currentErrors = { ...selectedUserError };

    const keys = list || [e?.target?.id];
    setSelectedUserError(null);
    keys.forEach(async (key) => {
      const value = selectedUser?.[key];
      if (typeof value === "string") {
        if (!value.length || value.trim() === "") {
          currentErrors[key] = getRequiredErrors(key);
        } else if (key === "usr_mail_id") {
          const isValid = emailRegex.test(value);
          if (!isValid) {
            currentErrors[key] = "Invalid email address format";
          } else {
            const emailStatus = await checkEmailExists();
            if (emailStatus) {
              currentErrors[key] = await checkEmailExists();
            } else {
              delete currentErrors[key];
            }
            setSelectedUserError({ ...currentErrors });
          }
        } else {
          currentErrors[key] = "";
        }
      }
    });

    setSelectedUserError(currentErrors);
  };

  const getUserList = async (query = "") => {
    setSearchQuery(query);
    if (!query) {
      if (userList.length) {
        setUserList([]);
      }
      return;
    }
    setFetchStatus("loading");
    debounceFunction(() => {
      fetchADUsers(query).then((result) => {
        const filtered =
          result?.data?.map((u) => {
            const { givenName, sn, displayName, mail } = u;
            return {
              ...u,
              label: `${
                givenName && sn ? `${givenName} ${sn}` : displayName
              }\n\t(${mail})`,
            };
          }) || [];
        filtered.sort(function (a, b) {
          const conditionA = a.givenName || a.displayName;
          const conditionB = b.givenName || b.displayName;
          if (conditionA < conditionB) {
            return -1;
          }
          if (conditionA > conditionB) {
            return 1;
          }
          return 0;
        });
        if (result.status === 1) {
          setUserList(filtered);
        }
        setLoading(false);
        if (result.status !== -1) {
          setFetchStatus("success");
        }
      });
    }, 500);
  };

  const validNewUserDataCondition = () =>
    selectedUser?.usr_fst_nm?.length &&
    selectedUser?.usr_lst_nm?.length &&
    selectedUser?.usr_mail_id?.length &&
    !selectedUserError?.usr_fst_nm &&
    !selectedUserError?.usr_lst_nm &&
    !selectedUserError?.usr_mail_id;

  const handleSave = async () => {
    setPingParent((oldValue) => oldValue + 1);
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
      setTargetUser(userRes.rows[0]);
      updateBreadcrump(userRes.rows[0]);
      setActive(userRes.rows[0].usr_stat === "Active" ? true : false);
    })();
  }, []);

  const switchUserType = (newUser) => {
    const defaultValues = null;
    setSelectedUser(defaultValues);
    setIsNewUser(newUser);
    setShowToolTip(false);
  };

  const checkSaveDisableCondition = () => {
    const sr = [...(checkUserAssignmentTableData || [])].slice(0, -1);
    const emptyRoles = sr.filter((x) => x.roles.length === 0);
    return (
      !selectedUser ||
      !sr?.length ||
      sr?.find((x) => x.study == null || emptyRoles.length) ||
      (isNewUser && !validNewUserDataCondition())
    );
  };

  const updateUserAssign = async (selectedStudies) => {
    const sr = [...selectedStudies].slice(0, -1);
    setStudiesRows(sr);
  };

  const getFullName = () => {
    if (selectedUser?.givenName && selectedUser?.sn) {
      return `${selectedUser?.givenName} ${selectedUser?.sn}`;
    }
    const splittedNames = selectedUser?.displayName?.split(", ") || [];
    const firstName =
      selectedUser?.givenName ||
      (splittedNames.length === 2 ? splittedNames[1] : splittedNames[0]);
    const lastName = selectedUser?.sn || splittedNames[0];
    return `${firstName} ${lastName}`;
  };

  const createUserAndAssignStudies = async () => {
    const email = isNewUser ? selectedUser.usr_mail_id : selectedUser.mail;
    const uid = selectedUser?.sAMAccountName;
    const employeeId = selectedUser?.extrnl_emp_id?.trim() || "";

    const formattedRows = studiesRows.map((e) => {
      return {
        protocolname: e?.study?.prot_nbr_stnd,
        roles: e.roles.map((r) => r.label),
      };
    });

    const insertUserStudy = {
      email,
      protocols: formattedRows,
    };

    let payload = {};

    if (isNewUser) {
      const { usr_fst_nm: firstName, usr_lst_nm: lastName } = selectedUser;
      payload = {
        firstName,
        lastName,
        employeeId,
        ...insertUserStudy,
      };
    } else {
      const splittedNames = selectedUser?.displayName?.split(", ") || [];
      const firstName =
        selectedUser.givenName ||
        (splittedNames.length === 2 ? splittedNames[1] : splittedNames[0]);
      const lastName = selectedUser.sn || splittedNames[0];
      payload = {
        firstName,
        lastName,
        uid,
        ...insertUserStudy,
      };
    }
    let response;
    if (isNewUser) {
      response = await inviteExternalUser(payload);
    } else {
      response = await inviteInternalUser(payload);
    }
    setConfirmInviteUser(false);
    setLoading(false);
    const msg = response.message;
    if (response.status === 1) {
      toast.showSuccessMessage(msg);
      history.push("/user-management");
    } else {
      toast.showErrorMessage(msg);
    }
    return null;
  };

  useEffect(() => {
    if (!studiesRows) {
      return false;
    }
    if (!selectedUser) {
      toast.showErrorMessage("Select a user or create a new one");
      return false;
    }
    if (!studiesRows.length) {
      toast.showErrorMessage("Add some studies to proceed");
      return false;
    }
    if (studiesRows.find((x) => x.study == null)) {
      // setInitialRender(!initialRender);
      // setTableStudies([...studiesRows]);
      toast.showErrorMessage("Please fill study or remove blank rows");
      return false;
    }
    if (studiesRows.find((x) => x.alreadyExist)) {
      toast.showErrorMessage("Please remove duplicate values");
      return false;
    }
    const emptyRoles = studiesRows.filter((x) => x.roles.length === 0);
    if (emptyRoles.length) {
      toast.showErrorMessage(
        `This assignment is incomplete. Please select a study and a role to continue.`
      );
      return false;
    }
    if (isNewUser) {
      setConfirmInviteUser(true);
      return true;
    }
    setLoading(true);
    createUserAndAssignStudies();
    return null;
  }, [studiesRows]);

  return (
    <div className="create-user-wrapper">
      {isShowAlertBox && (
        <AlertBox cancel={keepEditingBtn} submit={leavePageBtn} />
      )}
      {isNewUser && (
        <InviteUserModal
          open={confirmInviteUser}
          onSendInvite={async () => {
            if (validNewUserDataCondition()) {
              setLoading(true);
              createUserAndAssignStudies();
            } else {
              setConfirmInviteUser(false);
              const fields = ["usr_fst_nm", "usr_lst_nm", "usr_mail_id"];
              validateField(undefined, fields);
            }
          }}
          loading={loading}
          email={selectedUser?.usr_mail_id}
          stayHere={() => {
            setConfirmInviteUser(false);
            setLoading(false);
          }}
        />
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
            {!readOnly && (
              <Switch
                label="Active"
                className="inline-checkbox"
                checked={active}
                onChange={handleActive}
                size="small"
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
                  <div className="ml-3 user-update-font-500">{`${targetUser?.usr_fst_nm} ${targetUser?.usr_lst_nm}`}</div>
                </Typography>
                <Typography className="mt-4 user-update-label">
                  Email address
                  <div className="ml-3 user-update-font-500">
                    {targetUser?.usr_mail_id}
                  </div>
                </Typography>
                <Typography className="mt-4 user-update-label">
                  Employee ID
                  <div className="ml-3 user-update-font-500">
                    {targetUser?.usr_id}
                  </div>
                </Typography>
              </div>
            </Box>
          </Grid>
          <Grid item xs={9} className="contacts-wrapper">
            <div className="study-table">
              <UserAssignmentTable
                userId={userId}
                selectedUser={selectedUser}
                isNewUser={isNewUser}
                loading={loading}
                targetUser={targetUser}
                setLoading={setLoading}
                updateChanges={updateChanges}
                pingParent={pingParent}
                updateUserAssign={(e) => updateUserAssign(e)}
                showRolePopup={showRolePopup}
                setShowRolePopup={setShowRolePopup}
                setCheckUserAssignmentTableData={
                  setCheckUserAssignmentTableData
                }
                disableSaveBtn={(e) => setDisableSave(e)}
              />
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default AddUser;
