/* eslint-disable no-use-before-define */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable no-shadow */
import React, { useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, withRouter } from "react-router";
import NavigationBar from "apollo-react/components/NavigationBar";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { neutral7 } from "apollo-react/colors";
import Modal from "apollo-react/components/Modal";
import Typography from "apollo-react/components/Typography";
import Backdrop from "apollo-react/components/Backdrop";
import CircularProgress from "apollo-react/components/CircularProgress";
import Banner from "apollo-react/components/Banner";
import App from "apollo-react-icons/App";
import DashboardIcon from "apollo-react-icons/Dashboard";
import Question from "apollo-react-icons/Question";
import moment from "moment";
import Button from "apollo-react/components/Button";
import NavigationPanel from "./NavigationPanel/NavigationPanel";

// eslint-disable-next-line import/named
import { getUserInfo } from "../../utils/index";
// eslint-disable-next-line import/named
import { userLogOut, getRolesPermissions } from "../../services/ApiServices";
import { MessageContext } from "../Providers/MessageProvider";
import { AppContext } from "../Providers/AppProvider";
import {
  hideAlert,
  hideAppSwitcher,
  showAlert,
} from "../../store/actions/AlertActions";

const styles = {
  haveAccess: {
    color: "#e41e1e",
  },
  notapplied: {
    color: "yellow",
  },
  root: {
    display: "flex",
    height: 400,
    boxSizing: "content-box",
  },
  panelTitle: {
    padding: "24px 24px 16px 24px",
    fontWeight: 600,
  },
  card: {
    margin: "8px 24px",
    cursor: "pointer",
  },
  cardHighlight: {
    backgroundColor: "#d8e7fe",
  },
  bold: {
    fontWeight: 600,
  },
  cardSubtitle: {
    color: neutral7,
    lineHeight: "24px",
  },
  page: {
    padding: 24,
  },
  panelContent: {
    overflow: "auto",
    height: 333,
    minWidth: 300,
  },
  centerAligned: {
    display: "flex",
    alignItems: "center",
  },
  appIcon: {
    fontSize: 24,
    color: "#fff",
    cursor: "pointer",
  },
  helpIcon: {},
  navLogo: {
    color: "white",
    marginRight: 24,
    cursor: "pointer",
    zIndex: 2,
    whiteSpace: "nowrap",
  },
  fullNavHeight: {
    height: "100%",
  },
};

const useStyles = makeStyles(styles);

const AppHeader = ({ history, setLoggedIn }) => {
  const classes = useStyles();
  const userInfo = getUserInfo();
  const appContext = useContext(AppContext);
  const messageContext = useContext(MessageContext);
  const [panelOpen, setpanelOpen] = useState(true);
  const [notLoggedOutErr, setNotLoggedOutErr] = useState(false);
  const [open, setOpen] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const { permissions } = appContext.user;
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const alertStore = useSelector((state) => state.Alert);

  const onPanelClose = () => {
    setpanelOpen(false);
  };

  const getPermisions = async () => {
    if (permissions.length === 0) {
      let uniquePermissions = [];
      const data = await getRolesPermissions();
      console.log(">>> all permissions", data);
      if (data.message === "Something went wrong") {
        messageContext.showErrorMessage(
          `There was an issue authorizing your login information. Please contact your Administrator.`
        );
      } else {
        uniquePermissions = Array.from(
          data
            .reduce((acc, { categoryName, featureName, allowedPermission }) => {
              const current = acc.get(featureName) || {
                allowedPermission: [],
              };
              return acc.set(featureName, {
                ...current,
                categoryName,
                featureName,
                allowedPermission: [
                  ...current.allowedPermission,
                  allowedPermission,
                ],
              });
            }, new Map())
            .values()
        );
        appContext.updateUser({ permissions: uniquePermissions });
      }

      // console.log(uniquePermissions);
    }
  };

  useEffect(() => {
    getPermisions();
  }, []);

  const checkAccess = (name) => {
    if (permissions.length > 0) {
      const hasAccess = permissions.some((per) => per.featureName === name);
      return hasAccess;
    }
    return false;
  };
  const menuItems = [
    {
      featureName: "Launchpad",
      text: "Launchpad",
      pathname: "/launchpad",
      haveAccess: true,
    },
    {
      featureName: "Analytics",
      text: "Analytics",
      pathname: "/analytics",
      haveAccess: checkAccess("Analytics"),
    },
    {
      featureName: "Study Setup",
      text: "Study Setup",
      pathname: "/study-setup",
      haveAccess: checkAccess("Study Setup "),
    },
    {
      featureName: "User Management",
      text: "User Management",
      pathname: "/user-management",
      haveAccess: checkAccess("User Management"),
    },
    {
      menuItems: [
        {
          featureName: "Policy Management",
          text: "Policy Management",
          pathname: "/policy-management",
          haveAccess: checkAccess("Policy management "),
        },
        {
          featureName: "Role Management",
          text: "Role Management",
          pathname: "/role-management",
          haveAccess: checkAccess("Role management"),
        },
        {
          featureName: "Group Management",
          text: "Group Management",
          pathname: "/group-management",
          haveAccess: checkAccess("Group management"),
        },
        {
          featureName: "System Admin",
          text: "Vendor Admin",
          pathname: "/vendor/list",
          haveAccess: checkAccess("System management"),
        },
      ],
    },
  ];
  const filterMenuItem = menuItems.filter((Items) => Items.haveAccess === true);
  const subfilterMenuItem = menuItems[4].menuItems.filter(
    (item) => item.haveAccess === true
  );
  let filteredMenuItems = [];
  if (subfilterMenuItem.length > 0) {
    filteredMenuItems = [
      ...filterMenuItem,
      { text: "Admin", menuItems: subfilterMenuItem },
    ];
  } else {
    filteredMenuItems = [...filterMenuItem];
  }
  const profileMenuProps = {
    name: userInfo.fullName,
    title: userInfo.userEmail,
    email: userInfo.lastLogin ? (
      <span style={{ fontSize: "13px" }}>
        Last Login:
        {userInfo.lastLogin}
      </span>
    ) : (
      ""
    ),
    // eslint-disable-next-line no-use-before-define
    logoutButtonProps: { onClick: () => LogOut() },
    menuItems: [],
  };

  const LogOut = async () => {
    setOpen(true);
    const isLogout = await userLogOut();
    if (isLogout) {
      setLoggedIn(false);
      history.push("/logout");
      setOpen(false);
    } else {
      setNotLoggedOutErr(true);
      setOpen(false);
    }
  };
  const notificationsMenuProps = {
    newNotifications: true,
    notifications: [
      {
        icon: DashboardIcon,
        header: "Header",
        details: "Lorem ipsum dolor sit ame. Lorem ipsum dolor sit ame.",
        timestamp: moment(),
      },
    ],
  };
  useEffect(() => {
    // console.log(alertStore);
    if (alertStore?.showAppSwitcher) {
      setpanelOpen(true);
    }
  }, [alertStore]);

  const toggleMenu = () => {
    if (alertStore.isFormComponentActive && panelOpen === false) {
      dispatch(hideAppSwitcher());
      dispatch(showAlert());
    }
    // eslint-disable-next-line no-shadow
    if (alertStore.isFormComponentActive === false || undefined) {
      setpanelOpen((panelOpen) => !panelOpen);
    }
  };

  const ConfirmModal = React.memo(({ showVersionModal, closeModal }) => {
    return (
      <Modal
        open={showVersionModal}
        disableBackdropClick="true"
        onClose={closeModal}
        message={
          <div>
            <div>Clinical Data Analytics Suite</div>
            <p>Version 1.0</p>
          </div>
        }
        buttonProps={[{ label: "Close", onClick: closeModal }]}
        id="neutral"
      />
    );
  });
  return (
    <>
      <ConfirmModal
        showVersionModal={showVersionModal}
        closeModal={() => setShowVersionModal(false)}
      />
      <div id="topNavbar">
        <Backdrop style={{ zIndex: 1 }} open={open}>
          <CircularProgress variant="indeterminate" size="small" />
        </Backdrop>
        <Banner
          variant="error"
          open={notLoggedOutErr}
          onClose={() => setNotLoggedOutErr(false)}
          message="Error: There is some error in logging out!"
        />
        <NavigationBar
          LogoComponent={() => (
            <div className={classes.centerAligned}>
              <Button onClick={toggleMenu} className={classes.fullNavHeight}>
                <App className={classes.appIcon} />
              </Button>
              <Typography
                className={classes.navLogo}
                onClick={() => history.push("/launchpad")}
              >
                IQVIA™
                <span style={{ paddingLeft: 3 }} className={classes.bold}>
                  Clinical Data Analytics Suite
                </span>
              </Typography>
            </div>
          )}
          position="static"
          menuItems={filteredMenuItems}
          profileMenuProps={profileMenuProps}
          // eslint-disable-next-line no-shadow
          onClick={({ pathname }) => history.push(pathname)}
          className={
            // eslint-disable-next-line prefer-template
            "nav"
          }
          checkIsActive={(item) =>
            item.pathname
              ? item.pathname === pathname
              : item.menuItems.some((item) => item.pathname === pathname)
          }
          waves
          notificationsMenuProps={notificationsMenuProps}
          otherButtons={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <div className={classes.centerAligned}>
              <Button
                onClick={() => setShowVersionModal(true)}
                className={classes.fullNavHeight}
              >
                <Question className={classes.appIcon} />
              </Button>
            </div>
          }
        />

        <NavigationPanel open={panelOpen} onClose={onPanelClose} />
      </div>
      <Banner
        variant={messageContext.errorMessage.variant}
        open={messageContext.errorMessage.show}
        onClose={messageContext.bannerCloseHandle}
        message={messageContext.errorMessage.messages}
        id={`Message-Banner--${messageContext.errorMessage.variant}`}
        className={`Message-Banner top-${messageContext.errorMessage.top}`}
      />
    </>
  );
};

export default withRouter(AppHeader);
