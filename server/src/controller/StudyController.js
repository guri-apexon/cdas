const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");
const axios = require("axios");
const request = require("request");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.onboardStudy = async function (req, res) {
  const { sponsorName, studyId } = req.body;
  axios
    .post(
      "https://rds-cdrfsr-dev.gdev-car3-k8s.work.iqvia.com/fsr/study/onboard",
      {
        sponsorName,
        studyId,
      },
      {
        headers: {
          ClientId: "CDI",
          ClientSecret:
            "h+p78ADQ8Zwo1EiJdLPU9brxYe9qo64YUYoZAVq/VSjY1IOHsE3yiQ==",
          "Content-Type": "application/json",
        },
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
};
exports.studyList = function (req, res) {
  try {
    const searchParam = req.params.query.toLowerCase();
    const searchQuery = `SELECT ms.prot_nbr, ms.spnsr_nm, ms.proj_cd, ms.phase, ms.prot_status, ms.thptc_area, s.ob_stat from ${constants.DB_SCHEMA_NAME}.mdm_study ms
    FULL OUTER JOIN ${constants.DB_SCHEMA_NAME}.study s ON ms.prot_nbr = s.prot_nbr
    WHERE LOWER(ms.prot_nbr) LIKE '%${searchParam}%' OR 
    LOWER(ms.spnsr_nm) LIKE '%${searchParam}%' OR 
    LOWER(ms.proj_cd) LIKE '%${searchParam}%'
        LIMIT 60
        `;
    Logger.info({
      message: "studyList",
    });

    DB.executeQuery(searchQuery).then((response) => {
      const studies = response.rows || [];
      if (studies.length > 0) {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          studies
        );
      } else {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          []
        );
      }
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :studyList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.noOnboardedStat = function (req, res) {
  try {
    const query = `SELECT 
      COUNT(DISTINCT CASE WHEN ob_stat = 'In Progress'   THEN prot_id END) inprogress_count,
      COUNT(DISTINCT CASE WHEN ob_stat = 'Failed' THEN prot_id END) faliure_count FROM ${schemaName}.study`;
    DB.executeQuery(query).then((response) => {
      const studies = response.rows || [];
      if (studies.length > 0) {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          studies[0]
        );
      } else {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          []
        );
      }
    });
  } catch (err) {
    //throw error in json response with status 500.
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getStudyList = async (req, res) => {
  try {
    const query = `SELECT s.prot_id, prot_nbr as protocolnumber, phase, prot_stat as protocolstatus, spnsr_nm as sponsorname, s.insrt_tm as dateadded, s.updt_tm as dateedited, ob_stat as onboardingprogress, s.usr_descr as assignmentcount, thptc_area as therapeuticarea, proj_cd as projectcode FROM ${schemaName}.study s 
    inner join ${schemaName}.study_sponsor ss on s.prot_id = ss.prot_id 
    INNER JOIN ${schemaName}.sponsor cs2 ON cs2.spnsr_id = ss.spnsr_id ORDER BY s.insrt_tm`;

    const query2 = `SELECT prot_id, COUNT(DISTINCT usr_id) FROM ${schemaName}.study_user GROUP BY prot_id`;
    const query3 = `SELECT DISTINCT phase FROM ${schemaName}.study`;
    const query4 = `SELECT DISTINCT prot_stat as protocolstatus FROM ${schemaName}.study`;

    Logger.info({
      message: "getStudyList",
    });

    const $q1 = await DB.executeQuery(query);
    const $q2 = await DB.executeQuery(query2);
    const $q3 = await DB.executeQuery(query3);
    const $q4 = await DB.executeQuery(query4);

    const formatDateValues = await $q1.rows.map((e) => {
      let acc = $q2.rows.filter((d) => d.prot_id === e.prot_id);
      let newObj = acc[0] ? acc[0] : { count: 0 };
      let { count } = newObj;
      let editT = moment(e.dateedited).format("MM/DD/YYYY");
      let addT = moment(e.dateadded).format("MM/DD/YYYY");
      let newData = _.omit(e, ["prot_id"]);
      return {
        ...newData,
        dateadded: addT,
        dateedited: editT,
        assignmentcount: count,
      };
    });

    let uniquePhase = $q3.rows.map((e) => Object.values(e)).flat();
    let uniqueProtocolStatus = $q4.rows.map((e) => Object.values(e)).flat();
    // console.log('rows', $data.rows, formatDateValues);
    return apiResponse.successResponseWithData(res, "Operation success", {
      studyData: formatDateValues,
      uniquePhase: uniquePhase,
      uniqueProtocolStatus: uniqueProtocolStatus,
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :studyList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
