const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const constants = require("../config/constants");

exports.createRole = function (req, res) {
  try {
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};