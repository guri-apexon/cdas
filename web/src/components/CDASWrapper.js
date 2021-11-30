import { Route, Switch, withRouter, Redirect } from "react-router";
import { useHistory } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "apollo-react/components/Loader";
import { useState, useEffect } from "react";
const UnAuth = lazy(() => import("../pages/UnAuth"));
const Auth = lazy(() => import("../pages/Auth"));
const LandingScreen = lazy(() => import("../pages/LandingScreen"));
const DashBoard = lazy(() => import("../pages/DashBoard"));

const CDASWrapper = ({ match }) => {
  const [loggedIn, setLoggedIn] = useState(false);

  const getUrlPath = (route) => {
    // console.log(`${match.url}${route}`);
    // return `${match.url}${route}`;
    return `\test`
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
          <LandingScreen></LandingScreen>
          <Switch>
            <Route
              path={`/dashboard`}
              // path={`${getUrlPath('/dashboard')}`}
              exact
              render={() => <DashBoard />}
            />
            <Redirect from="/" to="/dashboard" />
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