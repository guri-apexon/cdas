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
    case "protocolnumber":
      return "Protocol Number";
    case "sponsorname":
      return "Sponsor Name";
    case "phase":
      return "Phase";
    case "protocolstatus":
      return "Protocol Status";
    case "dateadded":
      return "Date Added";
    case "dateedited":
      return "Date Edited";
    case "onboardingprogress":
      return "Onboarding Progress";
    case "assignmentcount":
      return "Assignment Count";
    case "therapeuticarea":
      return "Therapeutic Area";
    case "projectcode":
      return "Project Code";
    default:
      return "";
  }
};

export function getLastLogin() {
  const currentLogin = getCookie("user.last_login_ts");
  const localDate = moment.unix(currentLogin).local();
  return localDate.format("DD-MMM-YYYY hh:mm A");
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

export function getUserInfo() {
  return {
    fullName: `${getCookie("user.first_name")} ${getCookie("user.last_name")}`,
    userEmail: decodeURIComponent(getCookie("user.email")),
    lastLogin: getLastLogin(),
  };
}

let timerId;
export const debounceFunction = (func, delay) => {
  // Cancels the setTimeout method execution
  clearTimeout(timerId);
  // Executes the func after delay time.
  timerId = setTimeout(func, delay);
};

export const titleCase = (str) => {
  const splitStr = str.toLowerCase().split(" ");
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(" ");
};
