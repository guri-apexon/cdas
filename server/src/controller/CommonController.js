const DB = require("../config/db");
const moment = require("moment");
const request = require("request");
const axios = require("axios");
const btoa = require("btoa");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

const { FSR_HEADERS, FSR_API_URI, SDA_BASE_URL } = constants;

module.exports = {
  getSdkUsers: async (req, res) => {
    try {
      const { SDA_APP_KEY: sdaKey } = process.env;
      if (!sdaKey)
        return apiResponse.ErrorResponse(
          res,
          "Something went wrong with App key"
        );
      request(
        {
          rejectUnauthorized: false,
          url: `${SDA_BASE_URL}/sda-rest-api/api/external/entitlement/V1/ApplicationUsers/getUsersForApplication?appKey=${sdaKey}`,
          method: "GET",
        },
        function (err, response, body) {
          if (response?.body) {
            try {
              const responseBody = JSON.parse(response.body);
              return apiResponse.successResponseWithData(
                res,
                "Users retrieved successfully",
                responseBody
              );
            } catch (err) {
              return apiResponse.ErrorResponse(
                res,
                err.message || "Something went wrong"
              );
            }
          } else {
            return apiResponse.ErrorResponse(res, "Something went wrong");
          }
        }
      );
    } catch (err) {
      return apiResponse.ErrorResponse(res, err.message);
    }
  },
  fsrStudyStatus: async (studyId) => {
    if (!studyId) return false;
    return axios
      .get(`${FSR_API_URI}/study/onboard/status?studyId=${studyId}`, {
        headers: FSR_HEADERS,
      })
      .then((response) => {
        const status = response.data?.data?.status || null;
        return status;
      })
      .catch((err) => {
        return false;
      });
  },
  fsrConnect: (req, res) => {
    try {
      const { params, endpoint } = req.body;
      if (!endpoint || !params) {
        return apiResponse.ErrorResponse(res, "Something went wrong");
      }
      axios
        .post(`${FSR_API_URI}/${endpoint}`, params, {
          headers: FSR_HEADERS,
        })
        .then((response) => {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            response?.data
          );
        })
        .catch((err) => {
          if (err.response?.data) {
            return res.json(err.response.data);
          } else {
            return apiResponse.ErrorResponse(res, "Something went wrong");
          }
        });
    } catch (err) {
      Logger.error(err);
      console.log("err:", err);
      return apiResponse.ErrorResponse(res, err);
    }
  },
};

module.exports.auditEntry = async (name, id, diffObj, updatedObj, userId) => {
  try {
    // console.log("updated call", diffObj);

    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    for (let key of Object.keys(diffObj)) {
      let newData = updatedObj[key];
      let oldData = diffObj[key];
      if (diffObj[key] === null) {
        newData = null;
        key = "New Entry";
      }
      await DB.executeQuery(
        `INSERT INTO ${schemaName}.audit_log
                        ( tbl_nm, id, attribute, old_val, new_val, rsn_for_chg, updated_by, updated_on)
                        VALUES($1,$2,$3,$4,$5,$6,$7,$8);`,
        [name, id, key, oldData, newData, "User Requested", userId, currentTime]
      );
    }
    // console.log("updated");

    return;
  } catch (err) {
    console.log(err);
    Logger.error("catch :Audit log entry");
    Logger.error(err);
  }
};

module.exports.studyAudit = async (protId, column, oldVal, newVal, userId) => {
  try {
    // console.log("updated call");
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    await DB.executeQuery(
      `INSERT INTO ${schemaName}.study_audit_log
                        ( prot_id, attribute, old_val, new_val, rsn_for_chg, updated_by, updated_on)
                        VALUES($1,$2,$3,$4,$5,$6,$7);`,
      [protId, column, oldVal, newVal, "User Requested", userId, currentTime]
    );

    return;
  } catch (err) {
    console.log(err);
    Logger.error("catch :Audit log entry");
    Logger.error(err);
  }
};

module.exports.studyUserAudit = async (
  rollId,
  column,
  oldVal,
  newVal,
  userId
) => {
  try {
    // console.log("updated call");
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    await DB.executeQuery(
      `INSERT INTO ${schemaName}.study_user_role_audit_log
                        ( prot_usr_role_id, attribute, old_val, new_val, rsn_for_chg, updated_by, updated_on)
                        VALUES($1,$2,$3,$4,$5,$6,$7);`,
      [rollId, column, oldVal, newVal, "User Requested", userId, currentTime]
    );
    // console.log("updated");
    return;
  } catch (err) {
    console.log(err);
    Logger.error("catch :Audit log entry");
    Logger.error(err);
  }
};
