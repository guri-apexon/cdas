import moment from 'moment'

export const getUrl = (apiPath) => {
  return (
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
}

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
  const current_login = getCookie('user.current_login_ts')
  const local_date = moment.unix(current_login).local();
  return local_date.format("DD-MMM-YYYY hh:mm A"); 
}

export function getUserInfo() {
  return {
    full_name : getCookie('user.first_name') + " " +getCookie('user.last_name'),
    user_email : decodeURIComponent(getCookie('user.email')),
    last_login : getLastLogin()
  }
}

var  timerId;
export const  debounceFunction  =  function (func, delay) {
	// Cancels the setTimeout method execution
	clearTimeout(timerId);
	// Executes the func after delay time.
	timerId  =  setTimeout(func, delay)
}