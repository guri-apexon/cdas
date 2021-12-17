import { Route, Switch, Redirect } from "react-router";
import { useHistory } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "apollo-react/components/Loader";
import { useState, useEffect } from "react";

import { getCookie } from "../../utils";
import TopNavbar from "../TopNavbar/TopNavbar";
import AppFooter from "../AppFooter/AppFooter";
import StudySetup from "../../pages/StudySetup/StudySetup";
import UserManagement from "../../pages/UserManagement/UserManagement";
import NotAuthenticated from "../../pages/NotAuthenticated/NotAuthenticated";
import Logout from "../../pages/Logout/Logout";
const Auth = lazy(() => import("../../pages/Auth/Auth"));
const LaunchPad = lazy(() => import("../../pages/LaunchPad/LaunchPad"));
const Analytics = lazy(() => import("../../pages/Analytics/Analytics"));

const CDASWrapper = ({ match }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkedOnce, setCheckedOnce] = useState(false);
  let history = useHistory();

  const getUrlPath = (route) => {
    return `${route}`;
  };

  useEffect(() => {
    const userId = getCookie("user.id");
    console.log(userId);
    if(userId){
      history.push("/launchpad");
      setLoggedIn(true);
    } else {
      if(!checkedOnce){
        history.push("/checkAuth")
        setCheckedOnce(true);
      } else {
        history.push("/not-authenticated")
        setLoggedIn(false);
      }
    }
  }, []);

 
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
              path={`${getUrlPath("/analytics")}`}
              exact
              render={() => <Analytics />}
            />
            <Route
              path={`${getUrlPath("/cdi")}`}
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route
              path={`${getUrlPath("/user-management")}`}
              exact
              render={() => <UserManagement />}
            />
            <Route
              path={`${getUrlPath("/study-setup")}`}
              exact
              render={() => <StudySetup />}
            />
            <Route
              path={`${getUrlPath("/cdm")}`}
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route
              path={`${getUrlPath("/cdr")}`}
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route
              path={`${getUrlPath("/ca")}`}
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route
              path={`${getUrlPath("/dsw")}`}
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route
              path={`${getUrlPath("/study-admin")}`}
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route path={`/logout`} render={() => {
              setLoggedIn(false);
              <Logout />
            }} />
            <Redirect from="/" to="/launchpad" />

          </Switch>
          <AppFooter />
        </div>
      ) : (
        <Switch>
          <Route path={`/logout`} render={() => <Logout />} />
          <Route path={`/checkAuth`} exact render={() => <Auth />} />
          <Route path={`/not-authenticated`} render={() => <NotAuthenticated />} />
          <Redirect from="/" to="/checkAuth" />
        </Switch>
      )}
    </Suspense>
  );
};

export default CDASWrapper;
