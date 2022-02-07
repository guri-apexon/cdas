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

export const POLICY_LIST = "POLICY_LIST";
export const POLICY_LIST_SUCCESS = "POLICY_LIST_SUCCESS";
export const POLICY_LIST_FAILURE = "POLICY_LIST_FAILURE";

export const VENDOR_LIST = "VENDOR_LIST";
export const VENDOR_LIST_SUCCESS = "VENDOR_LIST_SUCCESS";
export const VENDOR_LIST_FAILURE = "VENDOR_LIST_FAILURE";

export const ROLE_LIST_FETCH = "ROLE_LIST_FETCH";
export const ROLE_LIST_FAILURE = "ROLE_LIST_FAILURE";
export const ROLE_LIST_SUCCESS = "ROLE_LIST_SUCCESS";

export const STUDY_NOTONBOARDED_STATUS = "STUDY_NOTONBOARDED_STATUS";
export const STUDY_NOTONBOARDED_SUCCESS = "STUDY_NOTONBOARDED_SUCCESS";
export const STUDY_NOTONBOARDED_FAILURE = "STUDY_NOTONBOARDED_FAILURE";

// API URLS
export const STUDYBOARD_DATA_FETCH = "v1/api/study/list";
export const STUDYSEARCH = "v1/api/study/search-study";
export const NOT_ONBOARDED_FETCH = "v1/api/study/notonboarded-studies-stat";
export const POLICY_LIST_FETCH = "v1/api/policy/list";
export const VENDOR_BASE = "v1/api/vendor";
// export const VENDOR_LIST_FETCH = `${VENDOR_BASE}/list`;
// export const ADD_VENDOR = `${VENDOR_BASE}/create`;
// export const UPDATE_VENDOR = `${VENDOR_BASE}/update`;
export const ROLE_FETCH = "v1/api/role/";

export const baseURL =
  process.env.REACT_APP_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:4000`;
export const remoteBaseUrl =
  "https://rds-cdrfsr-dev.gdev-car3-k8s.work.iqvia.com/fsr";
