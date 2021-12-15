import moment from "moment";

export const getUrl = (apiPath) => {
  return (
    // eslint-disable-next-line prefer-template
    window.location.protocol +
    "//" +
    window.location.hostname +
    ":4000" +
    apiPath
  );
};

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

export const columns = [
  {
    header: "Protocol Number",
    accessor: "ProtocolNumber",
    frozen: false,
    order: 1,
    isSelected: true,
  },
  {
    header: "Sponsor Name",
    accessor: "SponsorName",
    frozen: false,
    order: 2,
    isSelected: true,
  },
  {
    header: "Phase",
    accessor: "Phase",
    frozen: false,
    order: 3,
    isSelected: true,
  },
  {
    header: "Protocol Status",
    accessor: "ProtocolStatus",
    frozen: false,
    order: 4,
    isSelected: true,
  },
  {
    header: "Date Added",
    accessor: "DateAdded",
    frozen: false,
    order: 5,
    isSelected: true,
  },
  {
    header: "Date Edited",
    accessor: "DateEdited",
    frozen: false,
    order: 6,
    isSelected: true,
  },
  {
    header: "Onboarding Progress",
    accessor: "OnboardingProgress",
    frozen: false,
    order: 7,
    isSelected: true,
  },
  {
    header: "Assignment Count",
    accessor: "AssignmentCount",
    frozen: false,
    order: 8,
    isSelected: true,
  },
  {
    header: "Therapeutic Area",
    accessor: "TherapeuticArea",
    frozen: false,
    order: 9,
    isSelected: true,
  },
  {
    header: "Project Code",
    accessor: "ProjectCode",
    frozen: false,
    order: 10,
    isSelected: true,
  },
];

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
