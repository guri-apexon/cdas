import moment from "moment";
import React from "react";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import DateRangePickerV2 from "apollo-react/components/DateRangePickerV2";
import { TextField } from "apollo-react/components/TextField/TextField";

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
    firstName: getCookie("user.first_name"),
    lastName: getCookie("user.last_name"),
    userEmail: decodeURIComponent(getCookie("user.email")),
    lastLogin: getLastLogin(),
    user_id: getCookie("user.id"),
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

export const DateFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <div style={{ minWidth: 230 }}>
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
      row[accessor]?.toUpperCase().includes(value.toUpperCase())
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
