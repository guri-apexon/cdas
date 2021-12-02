import { Route, Switch, withRouter, Redirect } from "react-router";
// import { useHistory } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "apollo-react/components/Loader";
import { useState, useEffect } from "react";

import TopNavbar from "../TopNavbar/TopNavbar";
const UnAuth = lazy(() => import("../../pages/UnAuth/UnAuth"));
const Auth = lazy(() => import("../../pages/Auth/Auth"));
const LandingScreen = lazy(() => import("../../pages/LandingScreen/LandingScreen"));
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
        <>
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
            <Redirect from="/" to="/launchpad" />
          </Switch>
          {/* <CommonBanner></CommonBanner> */}
        </>
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