const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: dbSchema } = constants;

exports.create = function (req, res) {
  try {
    const { tbl_nm, id, attribute, old_val, new_val, rsn_for_chg, updated_by } =
      req.body;
    const query = `INSERT INTO ${dbSchema}.audit_log (tbl_nm,id,attribute,old_val,new_val,rsn_for_chg,updated_by,updated_on) values ($1, $2, $3, $4, $5, $6, $7, $8)`;
    const body = [
      tbl_nm,
      id,
      attribute,
      old_val,
      new_val,
      rsn_for_chg,
      updated_by,
      new Date(),
    ];
    DB.executeQuery(query, body)
      .then((result) => {
        console.log(result);
        return apiResponse.successResponse(res, "Operation Successful");
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.message);
      });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
