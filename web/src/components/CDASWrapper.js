import { Route, Switch, withRouter, Redirect } from "react-router";
import { lazy, Suspense } from "react";
import Loader from "apollo-react/components/Loader";
import TopNavbar from "./TopNavbar";
const Auth = lazy(() => import("../pages/Auth"));
const LandingScreen = lazy(() => import("../pages/LandingScreen"));
const DashBoard = lazy(() => import("../pages/DashBoard"));
const Analytics = lazy(() => import("../pages/Analytics"));

const CDASWrapper = ({ match }) => {
  const getUrlPath = (route) => {
    // console.log(`${match.url}${route}`);
    return `${route}`;
  };

  const auth = {
    authSuccess: true
  };

  return (
    <Suspense fallback={<Loader isInner></Loader>}>
      {auth.authSuccess ? (
        <>
          <TopNavbar />
          <Switch>
            <Route
              path={`${getUrlPath('/dashboard')}`}
              exact
              render={() => <DashBoard />}
            />
            <Route
              path={`${getUrlPath('/analytics')}`}
              exact
              render={() => <Analytics />}
            />
            {/* <Redirect from="/" to="/dashboard" /> */}
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