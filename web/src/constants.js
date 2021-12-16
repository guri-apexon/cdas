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

// API URLS

export const STUDYBOARD_DATA_FETCH = "v1/api/study/list";
export const STUDYSEARCH = "v1/api/study/search-study";
export const baseURL = process.env.API_URL || "http://localhost:443";
