import { withRouter, useHistory } from "react-router";
import NavigationBar from "apollo-react/components/NavigationBar";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { neutral7 } from "apollo-react/colors";
import Typography from "apollo-react/components/Typography";
import Backdrop from 'apollo-react/components/Backdrop';
import CircularProgress from 'apollo-react/components/CircularProgress';
import Banner from 'apollo-react/components/Banner';
import App from "apollo-react-icons/App";
import DashboardIcon from "apollo-react-icons/Dashboard";
import Question from "apollo-react-icons/Question";
import moment from "moment";
import Button from "apollo-react/components/Button";
import NavigationPanel from "../NavigationPanel/NavigationPanel";
import { useState } from "react";
import { getUserInfo, deleteAllCookies } from "../../utils";
import { userLogOut } from "../../services/ApiServices";
const styles = {
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
  nav: {
    overflow: "hidden",
  },
  fullNavHeight: {
    height: "100%",
  },
};

const menuItems = [
  {
    text: "Launchpad",
    pathname: "/launchpad",
  },
  {
    text: "Analytics",
    pathname: "/analytics",
  },
  {
    text: "Study Setup",
    pathname: "/study-setup",
  },
  {
    text: "User Management",
    pathname: "/user-management",
  },
  {
    text: "Admin",
    menuItems: [
      {
        text: "Policy Management",
        pathname: "/policy-management",
      },
      {
        text: "Role Management",
        pathname: "/role-management",
      },
      {
        text: "Group Management",
        pathname: "/group-management",
      },
      {
        text: "System Admin",
        pathname: "/system-admin",
      },
    ],
  },
];

const useStyles = makeStyles(styles);

const TopNavbar = ({ history, location: { pathname } }) => {
  const classes = useStyles();
  const histr = useHistory();
  const [panelOpen, setpanelOpen] = useState(true);
  const [notLoggedOutErr, setNotLoggedOutErr] = useState(false);
  const [open, setOpen] = useState(false);
  const userInfo = getUserInfo();
  const profileMenuProps = {
    name: userInfo.full_name, 
    title: userInfo.user_email,
    email: <span style={{ fontSize: '13px' }}>Last Login: {userInfo.last_login}</span>,
    logoutButtonProps: { onClick:  () => LogOut() },
    menuItems: [],
  };

  const LogOut = async () => {
    setOpen(true)
    const isLogout = await userLogOut();
    if(isLogout) {
      const deleted = await deleteAllCookies()
      if(deleted) {
        histr.push("/logout");
        setOpen(false)
      }
    } else {
      setNotLoggedOutErr(true)
      setOpen(false)
    }
  }

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
  const toggleMenu = () => {
    setpanelOpen((panelOpen) => !panelOpen);
  };
  const onPanelClose = () => {
    setpanelOpen(false);
  };
  return (
    <div id="topNavbar">
      <Backdrop
        style={{ zIndex: 1 }}
        open={open}
      >
        <CircularProgress variant="indeterminate" size="small"/>
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
              onClick={() => history.push("launchpad")}
            >
              {"IQVIA™"}{" "}
              <span className={classes.bold}>
                {"Clinical Data Analytics Suite"}
              </span>
            </Typography>
          </div>
        )}
        position="static"
        menuItems={menuItems}
        profileMenuProps={profileMenuProps}
        onClick={({ pathname }) => history.push(pathname)}
        checkIsActive={(item) =>
          item.pathname
            ? item.pathname === pathname
            : item.menuItems.some((item) => item.pathname === pathname)
        }
        waves
        notificationsMenuProps={notificationsMenuProps}
        otherButtons={
          <div className={classes.centerAligned}>
            <Button
              onClick={() => history.push("help")}
              className={classes.fullNavHeight}
            >
              <Question className={classes.appIcon} />
            </Button>
          </div>
        }
        className={classes.nav}
      />
      <NavigationPanel open={panelOpen} onClose={onPanelClose} />
    </div>
  );
};

export default withRouter(TopNavbar);
