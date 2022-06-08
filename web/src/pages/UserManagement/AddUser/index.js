/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";

import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Switch from "apollo-react/components/Switch";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import TextField from "apollo-react/components/TextField";
import Select from "apollo-react/components/Select";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import Trash from "apollo-react-icons/Trash";
import SearchIcon from "apollo-react-icons/Search";
import IconButton from "apollo-react/components/IconButton";
import PlusIcon from "apollo-react-icons/Plus";
import "./CreateUser.scss";
import Typography from "apollo-react/components/Typography";
import Link from "apollo-react/components/Link";
import Grid from "apollo-react/components/Grid";
import MenuItem from "apollo-react/components/MenuItem";
import Modal from "apollo-react/components/Modal";
import Paper from "apollo-react/components/Paper";

import _, { set } from "lodash";
import {
  addVendorService,
  deleteVendorContact,
  getUsers,
  assingUserStudy,
} from "../../../services/ApiServices";
import { selectVendor, getENSList } from "../../../store/actions/VendorAction";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import { getUserInfo, inputAlphaNumericWithUnderScore } from "../../../utils";
import usePermission, {
  Categories,
  Features,
} from "../../../components/Common/usePermission";
import {
  formComponentActive,
  hideAlert,
  showAppSwitcher,
  formComponentInActive,
  hideAppSwitcher,
} from "../../../store/actions/AlertActions";
import AlertBox from "../../AlertBox/AlertBox";
import UserAssignmentTable from "./UserAssignmentTable";

const userListURL = "/user-management";

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

const AddUser = () => {
  const toast = useContext(MessageContext);
  const dispatch = useDispatch();
  const history = useHistory();
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
  const [initialRender, setInitialRender] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [isAnyUpdate, setIsAnyUpdate] = useState(false);
  const [isShowAlertBox, setShowAlertBox] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userList, setUserList] = useState([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [pingParent, setPingParent] = useState(0);
  const [tableStudies, setTableStudies] = useState([]);

  const breadcrumpItems = [
    { href: "", onClick: () => history.push("/launchpad") },
    {
      title: "User Management",
      onClick: () => history.push(userListURL),
    },
    {
      title: isEditPage ? selectedUser : "Create New User",
    },
  ];

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
  const handleActive = (e, checked) => {
    setActive(checked);
    updateChanges();
  };
  const cancelEdit = () => {
    // unbFckRouter();
    setConfirm(false);
    history.push(userListURL);
  };

  const stayHere = () => {
    setConfirm(false);
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
    updateChanges();
    if (e.target.id === "uName") {
      inputAlphaNumericWithUnderScore(e, (v) => {
        setSelectedUser(v);
      });
    } else if (e.target.id === "uDescription") {
      // setVDescription(val);
    }
  };

  const getUserList = async () => {
    getUsers().then((result) => {
      const filtered =
        result.rows
          ?.filter((u) => u?.usr_typ?.trim().toLowerCase() === "internal")
          .map((u) => {
            return {
              ...u,
              label: `${u.usr_fst_nm} ${u.usr_lst_nm} (${u.usr_mail_id})`,
            };
          }) || [];
      filtered.sort(function (a, b) {
        if (a.usr_fst_nm < b.usr_fst_nm) {
          return -1;
        }
        if (a.usr_fst_nm > b.usr_fst_nm) {
          return 1;
        }
        return 0;
      });
      setUserList(filtered);
      setLoading(false);
    });
  };

  const handleSave = async () => {
    setPingParent((oldValue) => oldValue + 1);
  };

  useEffect(() => {
    dispatch(formComponentActive());
    getUserList();
  }, []);

  const switchUserType = (newUser) => {
    setSelectedUser(null);
    setIsNewUser(newUser);
  };

  const updateUserAssign = async (selectedStudies) => {
    const studiesRows = [...selectedStudies].slice(0, -1);
    if (!selectedUser) {
      toast.showErrorMessage("Select a user or create a new one");
      return false;
    }
    if (!studiesRows.length) {
      toast.showErrorMessage("Add some studies to proceed");
      return false;
    }
    if (studiesRows.find((x) => x.study == null)) {
      setInitialRender(!initialRender);
      setTableStudies([...studiesRows]);
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
    const formattedRows = studiesRows.map((e) => {
      return {
        protocolname: e?.study?.prot_nbr_stnd,
        roles: e.roles.map((r) => r.label),
      };
    });
    const insertUserStudy = {
      email: selectedUser.usr_mail_id,
      protocols: formattedRows,
      tenant: "t1",
    };
    setLoading(true);
    const response = await assingUserStudy(insertUserStudy);
    setLoading(false);
    if (response.data.status) {
      toast.showSuccessMessage(response.data.message, 0);
      history.push("/user-management");
    } else {
      toast.showErrorMessage(response.data.message, 0);
    }

    return null;
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
      <Paper style={{ padding: "16px 28px" }}>
        <Box className="top-content">
          <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
          <div className="flex full-cover">
            <div>
              <span style={{ marginBottom: 16 }}>
                <Link onClick={handleCancel} size="small">
                  &#x276E; Back to User Management
                </Link>
              </span>
            </div>
            <div className="flex top-actions">
              {!readOnly && (
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
                  readOnly
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
                          onClick: handleSave,
                        },
                      ]
                }
              />
            </div>
          </div>
          <Typography variant="title1" className="b-font title">
            {isEditPage ? selectedUser : "Add New User"}
          </Typography>
        </Box>
      </Paper>
      <div className="padded">
        <Grid container spacing={2}>
          {/* {console.log("save", disableSave)} */}
          <Grid item xs={3}>
            <Box>
              <div className="flex create-sidebar flexWrap">
                {isNewUser ? (
                  <>
                    <TextField
                      id="usr_fst_nm"
                      size="small"
                      label="First name"
                      inputProps={{
                        maxLength: 100,
                      }}
                      onChange={handleChange}
                    />
                    <TextField
                      id="usr_lst_nm"
                      size="small"
                      label="Last name"
                      inputProps={{
                        maxLength: 255,
                      }}
                      onChange={handleChange}
                    />
                    <TextField
                      type="email"
                      id="usr_mail_id"
                      size="small"
                      label="Email"
                      onChange={handleChange}
                    />
                    <TextField
                      id="extrnl_emp_id"
                      size="small"
                      label="Employee ID (optional)"
                      onChange={handleChange}
                    />
                    <Typography variant="body2" className="mt-4" gutterBottom>
                      Return to&nbsp;
                      <Link onClick={() => switchUserType(false)}>
                        add new user from list
                      </Link>
                    </Typography>
                  </>
                ) : (
                  <>
                    <div className="user-autocomplete">
                      <AutocompleteV2
                        matchFrom="any"
                        size="small"
                        fullWidth
                        forcePopupIcon
                        popupIcon={<SearchIcon fontSize="extraSmall" />}
                        source={userList}
                        label="Name"
                        placeholder="Search by name or email"
                        value={selectedUser}
                        onChange={(e, v, r) => {
                          // eslint-disable-next-line no-debugger
                          updateChanges();
                          setSelectedUser(v);
                        }}
                        enableVirtualization
                        // error={
                        //   row.alreadyExist ||
                        //   (!initialRender &&
                        //     !row[key] &&
                        //     row.index !== tableUsers[tableUsers.length - 1].index)
                        // }
                        // helperText={
                        //   row.alreadyExist
                        //     ? "This user already has assignments. Please select a different user to continue."
                        //     : !initialRender &&
                        //       !row[key] &&
                        //       row.index !==
                        //         tableUsers[tableUsers.length - 1].index &&
                        //       "Required"
                        // }
                      />
                    </div>
                    {selectedUser && (
                      <Typography className="mt-4">
                        <Label>Employee ID</Label>
                        <Value>{selectedUser.usr_id}</Value>
                      </Typography>
                    )}
                    <Typography variant="body2" className="mt-4" gutterBottom>
                      User not in the list?&nbsp;
                      <Link onClick={() => switchUserType(true)}>
                        Invite new user
                      </Link>
                    </Typography>
                  </>
                )}
              </div>
            </Box>
          </Grid>
          <Grid item xs={9} className="contacts-wrapper">
            <div className="study-table">
              <UserAssignmentTable
                selectedUser={selectedUser}
                isNewUser={isNewUser}
                loading={loading}
                setLoading={setLoading}
                updateChanges={updateChanges}
                pingParent={pingParent}
                updateUserAssign={(e) => updateUserAssign(e)}
              />
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default AddUser;
