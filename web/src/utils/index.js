import moment from "moment";

// export const getURL = (apiPath) => {
//   return (
//     // eslint-disable-next-line prefer-template
//     window.location.protocol +
//     "//" +
//     window.location.hostname +
//     ":443" +
//     apiPath
//   );
// };

export const getCookie = (key) => {
  const b = document.cookie.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`);
  return b ? b.pop() : "";
};

// URL Related
export function getQueryParams(query) {
  const queryStrings = query.substr(1).split("&");
  const queryParams = {};
  queryStrings.forEach((element) => {
    const keyAndValue = element.split("=");
    // eslint-disable-next-line prefer-destructuring
    queryParams[keyAndValue[0]] = keyAndValue[1];
  });
  return queryParams;
}

export function getPathnameAndSearch(path) {
  const arr = path.split("?");
  return {
    pathname: arr[0],
    search: `?${arr[1]}`,
  };
}

export const getHeaderValue = (accessor) => {
  switch (accessor) {
    case "ProtocolNumber":
      return "Protocol Number";
    case "SponsorName":
      return "Sponsor Name";
    case "Phase":
      return "Phase";
    case "ProtocolStatus":
      return "Protocol Status";
    case "DateAdded":
      return "Date Added";
    case "DateEdited":
      return "Date Edited";
    case "OnboardingProgress":
      return "Onboarding Progress";
    case "AssignmentCount":
      return "Assignment Count";
    case "TherapeuticArea":
      return "Therapeutic Area";
    case "ProjectCode":
      return "Project Code";
    default:
      return "";
  }
};

export function getLastLogin() {
  const currentLogin = getCookie("user.current_login_ts");
  const localDate = moment.unix(currentLogin).local();
  return localDate.format("DD-MMM-YYYY hh:mm A");
}

export function getUserInfo() {
  return {
    // eslint-disable-next-line prefer-template
    fullName: getCookie("user.first_name") + " " + getCookie("user.last_name"),
    userEmail: decodeURIComponent(getCookie("user.email")),
    lastLogin: getLastLogin(),
  };
}

export function deleteAllCookies() {
  const cookies = document.cookie.split(";");

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    // eslint-disable-next-line prefer-template
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
  return true;
}
