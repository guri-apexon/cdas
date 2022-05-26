export const PATH = "Path";
export const Success = "success";
export const Warning = "warning";
export const Info = "info";
export const Error = "error";

export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGOUT_REQUEST = "LOGOUT_REQUEST";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";

export const AUTH_SUCCESS = "AUTH_SUCCESS";
export const AUTH_FAILURE = "AUTH_FAILURE";

export const STUDYBOARD_DATA = "STUDYBOARD_DATA";
export const STUDYBOARD_FETCH_SUCCESS = "STUDYBOARD_FETCH_SUCCESS";
export const STUDYBOARD_FETCH_FAILURE = "STUDYBOARD_FETCH_FAILURE";

export const SELECTED_STUDY_DATA = "SELECTED_STUDY_DATA";

export const POLICY_LIST = "POLICY_LIST";
export const POLICY_LIST_SUCCESS = "POLICY_LIST_SUCCESS";
export const POLICY_LIST_FAILURE = "POLICY_LIST_FAILURE";
export const UPDATE_POLICY_STATUS_SUCCESS = "UPDATE_POLICY_STATUS_SUCCESS";
export const UPDATE_POLICY_STATUS = "UPDATE_POLICY_STATUS";
export const UPDATE_POLICY_STATUS_FAILURE = "UPDATE_POLICY_STATUS_FAILURE";

export const VENDOR_LIST = "VENDOR_LIST";
export const VENDOR_LIST_SUCCESS = "VENDOR_LIST_SUCCESS";
export const VENDOR_LIST_FAILURE = "VENDOR_LIST_FAILURE";

export const VENS_LIST = "VENS_LIST";
export const VENS_LIST_SUCCESS = "VENS_LIST_SUCCESS";
export const VENS_LIST_FAILURE = "VENS_LIST_FAILURE";

export const CREATE_VENDOR = "CREATE_VENDOR";
export const UPDATE_VENDOR_STATUS = "UPDATE_VENDOR_STATUS";

export const SHOW_ALERT_TRUE = "SHOW_ALERT_TRUE";
export const SHOW_ALERT_FALSE = "SHOW_ALERT_FALSE";

export const GET_VENDOR_DETAILS = "GET_VENDOR_DETAILS";
export const VENDOR_DETAILS_SUCCESS = "VENDOR_DETAILS_SUCCESS";
export const VENDOR_DETAILS_FAILURE = "VENDOR_DETAILS_FAILURE";

export const ROLE_LIST_FETCH = "ROLE_LIST_FETCH";
export const ROLE_LIST_FAILURE = "ROLE_LIST_FAILURE";
export const ROLE_LIST_SUCCESS = "ROLE_LIST_SUCCESS";
export const UPDATE_ROLE_STATUS_SUCCESS = "UPDATE_ROLE_STATUS_SUCCESS";
export const UPDATE_ROLE_STATUS = "UPDATE_ROLE_STATUS";
export const UPDATE_ROLE_STATUS_FAILURE = "UPDATE_ROLE_STATUS_FAILURE";

export const STUDY_NOTONBOARDED_STATUS = "STUDY_NOTONBOARDED_STATUS";
export const STUDY_NOTONBOARDED_SUCCESS = "STUDY_NOTONBOARDED_SUCCESS";
export const STUDY_NOTONBOARDED_FAILURE = "STUDY_NOTONBOARDED_FAILURE";
export const FORM_COMPONENT_ACTIVE = "FORM_COMPONENT_ACTIVE";
export const SHOW_APP_SWITCHER = "SHOW_APP_SWITCHER";
export const HIDE_APP_SWITCHER = "HIDE_APP_SWITCHER";
// API URLS
export const STUDYBOARD_DATA_FETCH = "v1/api/study/list";
export const STUDYSEARCH = "v1/api/study/search-study";
export const NOT_ONBOARDED_FETCH = "v1/api/study/notonboarded-studies-stat";
export const POLICY_LIST_FETCH = "v1/api/policy/list";
export const UPDATE_POLICY = "v1/api/policy/update/status";
export const ROLES_LIST = "study/select-roles";
export const VENDOR_BASE = "v1/api/vendor";
export const ASSIGN_BASE = "v1/api/study/assign";
// export const VENDOR_LIST_FETCH = `${VENDOR_BASE}/list`;
// export const ADD_VENDOR = `${VENDOR_BASE}/create`;
// export const UPDATE_VENDOR = `${VENDOR_BASE}/update`;
export const ROLE_FETCH = "v1/api/role/";
export const UPDATE_ROLE = "v1/api/role/update/status";

export const baseURL =
  process.env.REACT_APP_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:4000`;
export const API_URL = `${baseURL}/v1/api`;
export const remoteBaseUrl =
  "https://rds-cdrfsr-dev.gdev-car3-k8s.work.iqvia.com/fsr";
