import { Route, Switch, Redirect } from "react-router";
import { useLocation, useHistory } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import Loader from "apollo-react/components/Loader";

import { getCookie } from "./utils";
import TopNavbar from "./components/TopNavbar/TopNavbar";
import AppFooter from "./components/AppFooter/AppFooter";
import Logout from "./pages/Logout/Logout";
import Role from "./pages/Roles";

const LaunchPad = lazy(() => import("./pages/LaunchPad/LaunchPad"));
const StudySetup = lazy(() => import("./pages/StudySetup/StudySetup"));
const PolicyList = lazy(() =>
  import("./pages/Admin/Policy/ListPolicy/PolicyList")
);
const CreatePolicy = lazy(() =>
  import("./pages/Admin/Policy/CreatePolicy/CreatePolicy")
);
const UpdatePolicy = lazy(() =>
  import("./pages/Admin/Policy/UpdatePolicy/UpdatePolicy")
);
const CreateRole = lazy(() =>
  import("./pages/Admin/Role/CreateRole/CreateRole")
);
const UpdateRole = lazy(() =>
  import("./pages/Admin/Role/UpdateRole/UpdateRole")
);
const VendorList = lazy(() =>
  import("./pages/Admin/Vendor/VendorList/VendorList")
);
const CreateVendor = lazy(() =>
  import("./pages/Admin/Vendor/CreateVendor/CreateVendor")
);

const Empty = () => <></>;

const RoutesWrapper = () => {
  const [loggedIn, setLoggedIn] = useState(null);
  const [checkedOnce, setCheckedOnce] = useState(false);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const userId = getCookie("user.id");
    // console.log("Wrapper-props:", JSON.stringify(props));
    if (userId) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, [history]);

  useEffect(() => {
    const userId = getCookie("user.id");
    if (userId) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, [history]);

  useEffect(() => {
    const userId = getCookie("user.id");
    // console.log(userId);
    if (userId) {
      if (location.pathname === "/checkAuthentication") {
        history.push(`/launchpad`);
      }
      history.push(location.pathname);
    } else {
      // eslint-disable-next-line no-lonely-if
      if (!checkedOnce) {
        window.location.href = `${process.env.REACT_APP_LAUNCH_URL}`;
        setCheckedOnce(true);
      }
    }
  }, [checkedOnce, history]);

  return (
    <Suspense fallback={<Loader isInner />}>
      {loggedIn ? (
        <div className="page-wrapper">
          <TopNavbar setLoggedIn={setLoggedIn} />
          <Switch>
            <Route path="/launchpad" exact render={() => <LaunchPad />} />
            <Route
              path="/analytics"
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route
              path="/cdi"
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route
              path="/policy-management"
              exact
              render={() => <PolicyList />}
            />
            <Route
              path="/policy-management/:id"
              exact
              render={() => <UpdatePolicy />}
            />
            <Route
              path="/create-policy"
              exact
              render={() => <CreatePolicy />}
            />
            <Route path="/role-management" exact render={() => <Role />} />
            <Route path="/create-role" exact render={() => <CreateRole />} />
            <Route
              path="/role-management/:id"
              exact
              render={() => <UpdateRole />}
            />
            <Route
              path="/user-management"
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route path="/study-setup" exact render={() => <StudySetup />} />
            <Route
              path="/cdm"
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route
              path="/cdr"
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route
              path="/ca"
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route
              path="/dsw"
              exact
              render={() => <Redirect to="/launchpad" />}
            />
            <Route path="/vendor/list" exact render={() => <VendorList />} />
            <Route
              path="/vendor/edit/:id"
              exact
              render={() => <CreateVendor />}
            />
            <Route
              path="/vendor/create"
              exact
              render={() => <CreateVendor />}
            />
            <Redirect from="/" to="/launchpad" />
          </Switch>
          <AppFooter />
        </div>
      ) : (
        <div className="page-wrapper">
          <Switch>
            <Route path="/checkAuthentication" exact render={() => <Empty />} />
            <Route path="/logout" render={() => <Logout />} />
            <Redirect from="/" to="/checkAuthentication" />
          </Switch>
        </div>
      )}
    </Suspense>
  );
};

export default RoutesWrapper;
