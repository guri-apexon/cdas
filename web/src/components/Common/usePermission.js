import React, { useContext } from "react";
import { AppContext } from "../Providers/AppProvider";

// Categories
const STUDIES = "Studies";
const MENU = "Menu";
const SYS_ADMIN = "SysAdmin";
const LAUNCHPAD = "Launchpad";
const USERS = "Users";
const SECURITY = "Security";

// Features
const STUDY_ADD_NON_MDM_STUDY = "Study - Add non MDM study";
const STUDY_SETUP = "Study Setup";
const STUDY_ASSIGNMENTS = "Study assignments";
const SYSTEM_MANAGEMENT = "System management";
const VENDOR_MANAGEMENT = "Vendor Management";
const ROLE_MANAGEMENT = "Role management";
const POLICY_MANAGEMENT = "Policy management";
const LAUNCHPAD_CA = "Launchpad-CA";
const LAUNCHPAD_CDM = "Launchpad-CDM";
const LAUNCHPAD_CDI = "Launchpad-CDI";
const LAUNCHPAD_CDR = "Launchpad-CDR";
const LAUNCHPAD_DSW = "Launchpad-DSW";

const DOWNLOAD = "download";
const CREATE = "create";
const READ = "read";
const UPDATE = "update";
const ENABLE = "enable";

const Categories = {
  STUDIES,
  MENU,
  SYS_ADMIN,
  LAUNCHPAD,
  USERS,
  SECURITY,
};

const Features = {
  STUDY_ADD_NON_MDM_STUDY,
  STUDY_SETUP,
  STUDY_ASSIGNMENTS,
  SYSTEM_MANAGEMENT,
  VENDOR_MANAGEMENT,
  ROLE_MANAGEMENT,
  POLICY_MANAGEMENT,
  LAUNCHPAD_CA,
  LAUNCHPAD_CDM,
  LAUNCHPAD_CDI,
  LAUNCHPAD_CDR,
  LAUNCHPAD_DSW,
};

const Permissions = {
  DOWNLOAD,
  CREATE,
  READ,
  UPDATE,
  ENABLE,
};

/** custom hook to proviede permissions of a particular categopry and feature */
const usePermission = (category, feature) => {
  const appContext = useContext(AppContext);
  const { permissions } = appContext.user;
  const permission = permissions?.find(
    (p) =>
      p.categoryName?.trim().toUpperCase() === category?.trim().toUpperCase() &&
      p.featureName?.trim().toUpperCase() === feature?.trim().toUpperCase()
  );

  const checkPermission = (mode) =>
    !!(
      permission &&
      permission?.allowedPermission.find(
        (p) => p.toUpperCase() === mode.toUpperCase()
      )
    );

  const canCreate = checkPermission(Permissions.CREATE);
  const canRead = checkPermission(Permissions.READ);
  const canUpdate = checkPermission(Permissions.UPDATE);
  const canDownload = checkPermission(Permissions.DOWNLOAD);
  const readOnly = canRead && !canUpdate && !canCreate;
  const canEnabled = checkPermission(Permissions.ENABLE);
  const noPermission = permission && permission.allowedPermission?.length === 0;
  console.log(
    ">> permission ",
    permission,
    category,
    feature,
    canCreate,
    canRead,
    canUpdate,
    canDownload,
    canRead,
    canEnabled
  );
  return {
    canCreate,
    canRead,
    canUpdate,
    canDownload,
    canEnabled,
    checkPermission,
    noPermission,
    readOnly,
  };
};

export default usePermission;
export { Categories, Features, Permissions };
