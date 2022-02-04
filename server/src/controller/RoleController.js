const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const constants = require("../config/constants");
const helpers = require("../helpers/customFunctions");

exports.createRole = function (req, res) {
  try {
    const { name, description, policies, userId, status } = req.body;
    if(!policies?.length || !Array.isArray(policies)){
      return apiResponse.ErrorResponse(res, "Please select atleast one policy to proceed.");
      return false;
    }
    const currentTime = helpers.getCurrentTime();
    const roleValues = [
      name,
      description,
      status,
      userId,
      currentTime,
      userId,
      currentTime,
    ];
    DB.executeQuery(
      `INSERT into ${constants.DB_SCHEMA_NAME}.role(role_nm, role_desc, role_stat, created_by, created_on, updated_by, updated_on) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      roleValues
    ).then((response) => {
        const role = response.rows[0];
        console.log("role", role);
        const rolePolicyValues = [
          role.role_id,
          policyId,
          1,
          userId,
          currentTime,
          userId,
          currentTime,
        ];
        DB.executeQuery(
          `INSERT into ${constants.DB_SCHEMA_NAME}.role_policy(role_id, plcy_id, act_flg, created_by, created_on, updated_by, updated_on) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          roleValues
        ).then((response) => {
            console.log("response", response);
          });
      })
      .catch((err) => {
        const errMessage = err.code==23505 ? "Role Name should be unique - Please update the name and Save again" : err.detail;
        return apiResponse.ErrorResponse(res, errMessage);
      });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};