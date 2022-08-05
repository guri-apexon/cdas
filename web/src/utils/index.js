import moment from "moment";
import React from "react";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import DateRangePickerV2 from "apollo-react/components/DateRangePickerV2";
import DatePickerV2 from "apollo-react/components/DatePickerV2";
import { TextField } from "apollo-react/components/TextField/TextField";
import { IDLE_LOGOUT_TIME } from "./constants";

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
export const getColumnPxWidth = (
  tableWidth = window.innerWidth,
  columnWidth = "50%"
) => {
  if (!String(columnWidth).includes("%")) {
    return columnWidth;
  }
  const percentage = Number(columnWidth.replace("%", ""));
  return (tableWidth * percentage) / 100;
};
export const getOverflowLimit = (width, pageSpace = 0, fontSize = 14) => {
  if (String(width).includes("%")) {
    width =
      ((window.innerWidth - Number(pageSpace)) *
        Number(width.replace("%", ""))) /
      100;
  }
  return Math.round((Number(width) * 1.91) / fontSize);
};
export const getInnerElOverflLimit = (tableWidth, columnWidth) => {
  const width = getColumnPxWidth(tableWidth, columnWidth);
  return getOverflowLimit(width);
};
export const matchAppUrl = () => {
  let appUrl = getCookie("user.app_url");
  if (appUrl) appUrl = decodeURIComponent(appUrl);
  return window.location.origin === appUrl;
};

export function getLastLogin() {
  const currentLogin = getCookie("user.last_login_ts");
  if (currentLogin === "first_time" || !currentLogin) return null;
  return moment
    .utc(moment.unix(currentLogin))
    .local()
    .format("DD-MMM-YYYY hh:mm A");
}

const getDomainName = () => {
  const urlParts = window.location.hostname.split(".");
  return urlParts
    .slice(0)
    .slice(-(urlParts.length === 4 ? 3 : 2))
    .join(".");
};

export function deleteAllCookies() {
  const domain = getDomainName() || "";
  document.cookie.split(";").forEach(function (c) {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};domain=${domain}`);
  });
  return true;
}

export const getUserToken = () => {
  return getCookie("user.token");
};

let logoutSetTimeout = null;
const setLogoutTimeout = () => {
  if (!logoutSetTimeout) {
    logoutSetTimeout = setTimeout(() => {
      console.log("Succesfully login");
    }, 10000);
  }
};

export function getUserId(preventRedirect) {
  const userId = getCookie("user.id");
  // if (preventRedirect && userId) {
  //   setLogoutTimeout();
  // }
  if (!userId && !preventRedirect) {
    window.location.reload();
  }
  return userId;
}

export function getUserInfo() {
  return {
    fullName: decodeURIComponent(`${getCookie("user.first_name")} 
                                  ${getCookie("user.last_name")}`),
    firstName: getCookie("user.first_name"),
    lastName: getCookie("user.last_name"),
    userEmail: decodeURIComponent(getCookie("user.email")),
    lastLogin: getLastLogin(),
    user_id: getUserId(),
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

export const compareStrings = (accessor, sortOrder) => {
  return (rowA, rowB) => {
    if (!rowA[accessor]) {
      return 1;
    }
    if (!rowB[accessor]) {
      return -1;
    }
    const stringA = rowA[accessor].toString().toUpperCase();
    const stringB = rowB[accessor].toString().toUpperCase();
    if (sortOrder === "asc") {
      if (stringA < stringB) {
        return -1;
      }

      if (stringA > stringB) {
        return 1;
      }

      return 0;
    }
    if (stringA < stringB) {
      return 1;
    }

    if (stringA > stringB) {
      return -1;
    }

    return 0;
  };
};

export const compareNumbers = (accessor, sortOrder) => {
  return (rowA, rowB) => {
    if (!rowA[accessor]) {
      return 1;
    }
    if (!rowB[accessor]) {
      return -1;
    }
    const numberA = rowA[accessor];
    const numberB = rowB[accessor];

    if (sortOrder === "asc") {
      return numberA - numberB;
    }
    return numberB - numberA;
  };
};

/* eslint-disable react/display-name */
export const compareDates = (accessor, sortOrder) => {
  return (rowA, rowB) => {
    const dateA = rowA[accessor];
    const dateB = rowB[accessor];

    if (sortOrder === "asc") {
      if (moment(dateA).isBefore(dateB)) {
        return -1;
      }
      if (moment(dateB).isBefore(dateA)) {
        return 1;
      }
      return 0;
    }
    if (moment(dateA).isBefore(dateB)) {
      return 1;
    }
    if (moment(dateB).isBefore(dateA)) {
      return -1;
    }
    return 0;
  };
};

// eslint-disable-next-line consistent-return
export const inputAlphaNumeric = (e, callback) => {
  const value = e.target.value
    ? e.target.value.replace(/[^0-9a-zA-Z]+/gi, "")
    : "";

  if (e.target.value !== value) {
    e.target.value = value;
  }

  if (typeof callback === "function") {
    return callback(value);
  }
};

// eslint-disable-next-line consistent-return
export const inputAlphaNumericWithUnderScore = (e, callback) => {
  const value = e.target.value
    ? e.target.value.replace(/[^0-9a-zA-Z_]+/gi, "")
    : "";

  if (e.target.value !== value) {
    e.target.value = value;
  }

  if (typeof callback === "function") {
    return callback(value);
  }
};

export const createAutocompleteFilter =
  (source) =>
  ({ accessor, filters, updateFilterValue }) => {
    const ref = React.useRef();
    const [height, setHeight] = React.useState(0);
    const [isFocused, setIsFocused] = React.useState(false);
    const value = filters[accessor];

    React.useEffect(() => {
      const curHeight = ref?.current?.getBoundingClientRect().height;
      if (curHeight !== height) {
        setHeight(curHeight);
      }
    }, [value, isFocused, height]);

    return (
      <div
        style={{
          minWidth: 160,
          maxWidth: 200,
          position: "relative",
          height,
        }}
      >
        <AutocompleteV2
          style={{ position: "absolute", left: 0, right: 0 }}
          value={
            value
              ? value.map((label) => {
                  if (label === "") {
                    return { label: "blanks" };
                  }
                  return { label };
                })
              : []
          }
          name={accessor}
          source={source}
          onChange={(event, value2) => {
            updateFilterValue({
              target: {
                name: accessor,
                value: value2.map(({ label }) => {
                  if (label === "blanks") {
                    return "";
                  }
                  return label;
                }),
              },
            });
          }}
          fullWidth
          multiple
          chipColor="white"
          size="small"
          forcePopupIcon
          showCheckboxes
          limitChips={1}
          filterSelectedOptions={false}
          enableVirtualization
          blurOnSelect={false}
          clearOnBlur={false}
          disableCloseOnSelect
          matchFrom="any"
          showSelectAll
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          ref={ref}
          noOptionsText="No matches"
        />
      </div>
    );
  };

export const TextFieldFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <TextField
      value={filters[accessor]}
      name={accessor}
      onChange={updateFilterValue}
      fullWidth
      margin="none"
      size="small"
    />
  );
};

export const IntegerFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <TextField
      value={filters[accessor]}
      name={accessor}
      onChange={updateFilterValue}
      type="number"
      style={{ width: 74 }}
      margin="none"
      size="small"
    />
  );
};

// overwriting numberSearchFilter from react-apollo

export const numberSearchFilter = (accessor) => {
  return function (row, filters) {
    const rowVal = parseInt(row[accessor], 10);
    const filterVal = parseInt(filters[accessor], 10);
    if (!filters[accessor]) {
      return true;
    }

    if (!row[accessor]) {
      return false;
    }
    return rowVal === filterVal;
  };
};
export const dateFilterCustom = (accessor) => (row, filters) => {
  if (!filters[accessor]) {
    return true;
  }
  if (!row[accessor]) {
    return false;
  }
  const date = moment(row[accessor]);
  const fromDate = moment(filters[accessor][0], "YYYY-MM-DD");

  const toDate = moment(filters[accessor][1], "YYYY-MM-DD").endOf("day");

  return (
    (!fromDate.isValid() || date.isAfter(fromDate)) &&
    (!toDate.isValid() || date.isBefore(toDate))
  );
  // const selectDate = moment(filters[accessor]).format("DD-MMM-YYYY");
  // console.log(selectDate === date);
  // return selectDate === date;
};

export const DateFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    // <div style={{ marginTop: "-21px" }}>
    //   <DatePickerV2
    //     value={filters[accessor]}
    //     onChange={(value) => {
    //       updateFilterValue({
    //         target: { name: accessor, value },
    //       });
    //     }}
    //     placeholder=""
    //     label=""
    //     fullWidth
    //     margin=""
    //     dateFormat="DD-MMM-YYYY"
    //     size="small"
    //   />
    // </div>
    <div style={{ minWidth: 180 }}>
      <div style={{ position: "absolute", top: 0, paddingRight: 4 }}>
        <DateRangePickerV2
          value={filters[accessor] || [null, null]}
          name={accessor}
          onChange={(value) =>
            updateFilterValue({
              target: { name: accessor, value },
            })
          }
          startLabel=""
          endLabel=""
          placeholder=""
          fullWidth
          margin="none"
          size="small"
        />
      </div>
    </div>
  );
};

export const createStringArraySearchFilter = (accessor) => {
  return (row, filters) =>
    !Array.isArray(filters[accessor]) ||
    filters[accessor].length === 0 ||
    filters[accessor].some(
      (value) => value.toUpperCase() === row[accessor]?.toUpperCase()
    );
};

export const createStringArrayIncludedFilter = (accessor) => {
  return (row, filters) =>
    !Array.isArray(filters[accessor]) ||
    filters[accessor].length === 0 ||
    filters[accessor].some((value) =>
      row[accessor]?.toUpperCase().includes(value?.toUpperCase())
    );
};

export const Capitalize = (str) => {
  // console.log(str, "stt");
  return str && str.charAt(0).toUpperCase() + str.slice(1);
};

export const createFilterList = (list) => {
  return Array.from(
    new Set(list?.map((r) => ({ label: r })).map((item) => item.label))
  )
    .map((label) => {
      return { label };
    })
    .sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }
      return 0;
    });
};

export const createSourceFromKey = (tableRows, key) => {
  return Array.from(
    new Set(
      tableRows
        ?.map((r) => ({ label: Capitalize(r[key]) }))
        .map((item) => item.label)
    )
  )
    .map((label) => {
      return { label };
    })
    .sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }
      return 0;
    });
};

export const getAppUrl = (app) => {
  let appUrl;
  switch (app) {
    case "CDI":
      appUrl =
        process.env.REACT_APP_CDI_URL ||
        `${window.location.protocol}//${window.location.hostname}:3000`;
      break;

    case "CDM":
      appUrl =
        process.env.REACT_APP_CDM_URL ||
        `${window.location.protocol}//${window.location.hostname}:3000`;
      break;

    default:
      appUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
      break;
  }
  // eslint-disable-next-line consistent-return
  return appUrl;
};
export const goToApp = (path) => {
  window.location.href = path;
};

export const setIdleLogout = (logout) => {
  let time;
  // DOM Events
  function resetTimer() {
    clearTimeout(time);
    time = setTimeout(() => {
      logout();
    }, IDLE_LOGOUT_TIME);
  }
  document.onmousemove = resetTimer;
  document.onkeypress = resetTimer;
  window.onload = resetTimer;
};
