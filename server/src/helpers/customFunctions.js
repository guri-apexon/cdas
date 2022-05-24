const uuid = require("uuid");
const crypto = require("crypto");
const moment = require("moment");

const getAlphaNumeric = () => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (var i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

exports.createUniqueID = () => {
  return getAlphaNumeric();
  // return crypto.randomBytes(3 * 4).toString("base64");
};
exports.getCurrentTime = (utc) => {
  if (utc) return moment().utc();
  return new Date().toISOString();
};
exports.getDomainWithoutSubdomain = (url) => {
  const urlParts = new URL(url).hostname.split(".");
  return urlParts
    .slice(0)
    .slice(-(urlParts.length === 4 ? 3 : 2))
    .join(".");
};
exports.stringToBoolean = (string) => {
  switch (string?.toString().toLowerCase().trim()) {
    case "true":
    case "yes":
    case "1":
      return true;
    case "false":
    case "no":
    case "0":
    case null:
      return false;
    default:
      return Boolean(string);
  }
};

const stringToBoolean = (exports.stringToBoolean = (string) => {
  switch (string?.toString().toLowerCase().trim()) {
    case "true":
    case "yes":
    case "1":
      return true;
    case "false":
    case "no":
    case "0":
    case null:
      return false;
    default:
      return false;
  }
});

exports.validateEmail = (email) =>
  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
