const uuid = require("uuid");
const crypto = require("crypto");
const moment = require("moment");
const _ = require("lodash");

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

exports.getdiffKeys = (newObj, oldObj) => {
  if (
    typeof newObj === "object" &&
    !Array.isArray(newObj) &&
    newObj !== null &&
    typeof oldObj === "object" &&
    !Array.isArray(oldObj) &&
    oldObj !== null
  ) {
    return _.pickBy(newObj, (v, k) => !_.isEqual(oldObj[k], v));
  }
  return {};
};

exports.formattedObj = (obj) => {
  let newObj;
  Object.keys(obj).forEach((key) => {
    if (obj.act_flg === null) {
      newObj = {
        ...obj,
        act_flg: 0,
      };
    } else {
      newObj = { ...obj };
    }
  });
  return newObj;
};

exports.getJWTokenFromHeader = (req) => {
  let authToken = undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    authToken = req.headers.authorization.split(" ")[1];
  }
  return authToken;
};

// check for roles while creating user
exports.checkProtocolRoles = (protocols) => {
  if (!protocols) return false;

  let isValid = true;
  // checking roles field in protocols
  protocols?.forEach((protocol) => {
    if (!protocol.roles || protocol?.roles?.length === 0) {
      isValid = false;
    }

    // check if roles is passed as string
    if (isValid) {
      protocol?.roles?.forEach((role) => {
        if (!(typeof role === "number")) {
          isValid = false;
        }
      });
    }
  });

  return isValid;
};

exports.checkProtocolRoleIds = (protocols) => {
  if (!protocols) return false;

  let isValid = true;
  // checking roleIds field in protocols
  protocols?.forEach((protocol) => {
    if (!protocol.roleIds || protocol?.roleIds?.length === 0) {
      isValid = false;
    }

    // check if roleIds is passed as string
    if (isValid) {
      protocol?.roleIds?.forEach((role) => {
        if (!(typeof role === "number")) {
          isValid = false;
        }
      });
    }
  });

  return isValid;
};
