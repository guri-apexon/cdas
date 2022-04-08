const DB = require("../config/db");
const moment = require("moment");
const request = require("request");
const axios = require("axios");
const btoa = require("btoa");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const constants = require("../config/constants");

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
            try{
              const responseBody = JSON.parse(response.body);
              return apiResponse.successResponseWithData(
                res,
                "Users retrieved successfully",
                responseBody
              );
            }catch(err){
              return apiResponse.ErrorResponse(res, err.message || "Something wrong");
            }
          } else {
            return apiResponse.ErrorResponse(res, "Something wrong");
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
