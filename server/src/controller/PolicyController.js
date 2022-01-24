const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const moment = require("moment");
const constants = require('../config/constants');

exports.createPolicy = function (req, res) {
  try {
    const { policyName, policyDesc } = req.body;
    console.log("policyName, policyDesc", policyName, policyDesc);
    const searchQuery = ``;
    DB.executeQuery(searchQuery).then((response) => {
      const studies = response.rows || [];
      return apiResponse.successResponseWithData(res, "Operation success", []);
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};
