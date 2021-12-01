import { Route, Switch, withRouter, Redirect } from "react-router";
import { lazy, Suspense } from "react";
import Loader from "apollo-react/components/Loader";
import NavigationBar from 'apollo-react/components/NavigationBar';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { neutral7 } from 'apollo-react/colors';
import Typography from 'apollo-react/components/Typography';
import App from 'apollo-react-icons/App';
import { Link } from "@material-ui/core";
import { createMemoryHistory } from 'history';


const styles = {
    root: {
        display: 'flex',
        height: 400,
        boxSizing: 'content-box',
    },
    panelTitle: {
        padding: '24px 24px 16px 24px',
        fontWeight: 600,
    },
    card: {
        margin: '8px 24px',
        cursor: 'pointer',
    },
    cardHighlight: {
        backgroundColor: '#d8e7fe',
    },
    bold: {
        fontWeight: 600,
    },
    cardSubtitle: {
        color: neutral7,
        lineHeight: '24px',
    },
    page: {
        padding: 24,
    },
    panelContent: {
        overflow: 'auto',
        height: 333,
        minWidth: 300,
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center'
    },
    appIcon: {
        fontSize: 24,
        color: '#fff',
        cursor: 'pointer',
    },
    navLogo: {
        color: 'white',
        marginRight: 24,
        marginLeft: 10,
        cursor: 'pointer',
        zIndex: 2,
        whiteSpace: 'nowrap',
    },
    nav: {
        overflow: 'hidden',
    },
};

const menuItems = [
    {
        text: 'Launchpad',
        pathname: '/dashboard',
    },
    {
        text: 'Analytics',
        pathname: '/analytics',
    },
    {
        text: 'Admin',
        menuItems: [
            {
                text: 'Study Admin',
                pathname: '/study-admin',
            },
            {
                text: 'User Setup',
                pathname: '/user-setup',
            },
            {
                text: 'Security Admin',
                menuItems: [
                    {
                        text: 'Policies',
                        pathname: '/policies',
                    },
                    {
                        text: 'Roles',
                        pathname: '/roles',
                    },
                    {
                        text: 'Groups',
                        pathname: '/groups',
                    },
                ],
            },
            {
                text: 'System Admin',
                pathname: '/system-admin',
            },
        ],
    },
];

const useStyles = makeStyles(styles);



const TopNavbar = ({ history, location: { pathname } }) => {
    const classes = useStyles();
    // const history = createMemoryHistory();

    return (
        <div>
            <NavigationBar
                LogoComponent={() => (
                    <div className={classes.logoContainer}>
                    <Link>
                        <App className={classes.appIcon} />
                    </Link>
                    <Typography className={classes.navLogo} onClick={() => history.push('dashboard')}>
                        {'IQVIA™'} <span className={classes.bold}>{'Clinical Data Analytics Suite'}</span>
                    </Typography>
                    </div>
                )}
                position="static"
                menuItems={menuItems}
                onClick={({ pathname }) => history.push(pathname)}
                checkIsActive={(item) =>
                  item.pathname
                    ? item.pathname === pathname
                    : item.menuItems.some((item) => item.pathname === pathname)
                }
                waves
                className={classes.nav}
            />
        </div>
    );
};

export default withRouter(TopNavbar);