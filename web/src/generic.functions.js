// export function convertUTCToLocalString(date) {
//   var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

//   var offset = date.getTimezoneOffset() / 60;
//   var hours = date.getHours();

//   newDate.setHours(hours - offset);

//   return newDate;
// }

// convertUTCToLocalString("1994-11-05T13:15:30Z");

export function UTCToLocalString(date) {
  return new Date(date);
}

export function localStringtoUTCFormat(date) {
  date = date !== undefined ? date : new Date();
  let updatedTimeStamp = "";
  const month =
    date.getUTCMonth() + 1 < 10
      ? `0${date.getUTCMonth() + 1}`
      : date.getUTCMonth();

  const hours =
    date.getUTCHours() < 10 ? `0${date.getUTCHours()}` : date.getUTCHours();
  updatedTimeStamp = `${date.getUTCFullYear()}-${month}-${date.getUTCDate()}T${hours}:${date.getUTCMinutes()}:${date.getUTCSeconds()}z`;
  return updatedTimeStamp;
}
