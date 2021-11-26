import { Route, Switch, withRouter, Redirect } from "react-router";
import { lazy, Suspense } from "react";
import Loader from "apollo-react/components/Loader";
const Auth = lazy(() => import("../pages/Auth"));
const LandingScreen = lazy(() => import("../pages/LandingScreen"));
const DashBoard = lazy(() => import("../pages/DashBoard"));

const CDASWrapper = ({ match }) => {
  const getUrlPath = (route) => {
    // console.log(`${match.url}${route}`);
    // return `${match.url}${route}`;
    return `\test`
  };

  const auth = {
    authSuccess: false
  };

  return (
    <Suspense fallback={<Loader isInner></Loader>}>
      {auth.authSuccess ? (
        <>
          <LandingScreen></LandingScreen>
          <Switch>
            <Route
              path={`${getUrlPath('/dashboard')}`}
              exact
              render={() => <DashBoard />}
            />
            <Redirect from="/" to="/dashboard" />
          </Switch>
          {/* <CommonBanner></CommonBanner> */}
        </>
      ) : (
        <Switch>
          <Route path={`${getUrlPath('/new')}`} exact render={() => <Auth />} />
          <Redirect from="/" to="/auth" />
        </Switch>
      )}
    </Suspense>
  );
};

export default CDASWrapper