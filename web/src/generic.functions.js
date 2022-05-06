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
  let updatedTimeStamp = "";

  updatedTimeStamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}T${date.getHours()}:${date.getMinutes()}
   :${date.getSeconds()}z`;

  return updatedTimeStamp;
}
