const DB = require("../config/db");
const moment = require("moment");
const axios = require("axios");
const btoa = require("btoa");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const constants = require("../config/constants");

const { FSR_HEADERS, FSR_API_URI } = constants;

module.exports = {
  fsrStudyStatus: async (studyId) => {
    if(!studyId) return false;
    return axios
    .get(
      `${FSR_API_URI}/study/onboard/status?studyId=${studyId}`,
      {
        headers: FSR_HEADERS,
      }
    )
    .then((response) => {
      const status = response.data?.data?.status || null;
      return status;
    })
    .catch((err) => {
      return false;
    });
  },
  fsrConnect: (req, res) => {
      try{
        const { params, endpoint } = req.body;
        if(!endpoint || !params) {
          return apiResponse.ErrorResponse(res, "Something went wrong");
        }
        axios
          .post(
            `${FSR_API_URI}/${endpoint}`,
            params,
            {
              headers: FSR_HEADERS,
            }
          )
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
