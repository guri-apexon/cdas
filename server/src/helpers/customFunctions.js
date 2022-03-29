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
exports.getCurrentTime = () => {
  return new Date().toISOString();
  return moment().utc().format("YYYY-MM-DD HH:mm:ss");
};
exports.getDomainWithoutSubdomain = url => {
  const urlParts = new URL(url).hostname.split('.');
  return urlParts
    .slice(0)
    .slice(-(urlParts.length === 4 ? 3 : 2))
    .join('.')
}