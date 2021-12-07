import { Route, Switch, withRouter, Redirect } from "react-router";
// import { useHistory } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "apollo-react/components/Loader";
import { useState, useEffect } from "react";

import TopNavbar from "../TopNavbar/TopNavbar";
import AppFooter from "../AppFooter/AppFooter";
import StudySetup from "../../pages/StudySetup/StudySetup";
import UserManagement from "../../pages/UserManagement/UserManagement";
const UnAuth = lazy(() => import("../../pages/UnAuth/UnAuth"));
const Auth = lazy(() => import("../../pages/Auth/Auth"));
const LaunchPad = lazy(() => import("../../pages/LaunchPad/LaunchPad"));
const Analytics = lazy(() => import("../../pages/Analytics/Analytics"));

const CDASWrapper = ({ match }) => {
  const [loggedIn, setLoggedIn] = useState(false);

  const getUrlPath = (route) => {
    // console.log(`${match.url}${route}`);
    return `${route}`;
  };
  
  let userData = JSON.parse(localStorage.getItem('userDetails'));

  useEffect(() => {
    // console.log(window.location.href);
    if(userData && userData.code){
      setLoggedIn(true);
    }
    console.log(userData)
  }, [userData])


  return (
    
    <Suspense fallback={<Loader isInner></Loader>}>
      {loggedIn ? (
        <div className="page-wrapper">
          <TopNavbar />
          <Switch>
            <Route
              path={`/launchpad`}
              // path={`${getUrlPath('/dashboard')}`}
              exact
              render={() => <LaunchPad />}
            />
            <Route
              path={`${getUrlPath('/analytics')}`}
              exact
              render={() => <Analytics />}
            />
            <Route
              path={`${getUrlPath('/cdi')}`}
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route
              path={`${getUrlPath('/user-management')}`}
              exact
              render={() => <UserManagement />}
            />
            <Route
              path={`${getUrlPath('/study-setup')}`}
              exact
              render={() => <StudySetup />}
            />
            <Route
              path={`${getUrlPath('/cdm')}`}
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route
              path={`${getUrlPath('/cdr')}`}
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route
              path={`${getUrlPath('/ca')}`}
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route
              path={`${getUrlPath('/dsw')}`}
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route
              path={`${getUrlPath('/study-admin')}`}
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Redirect from="/" to="/launchpad" />
          </Switch>
          <AppFooter />
        </div>
      ) : (
        <Switch>
          <Route path={`/unauth`} exact render={() => <UnAuth />} />
          <Route path={`/oauth2client`} render={() => <Auth />} />
          <Redirect from="/" to="/unauth" />
        </Switch>
      )}
    </Suspense>
  );
};

export default CDASWrapper