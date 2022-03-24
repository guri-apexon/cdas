const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");
const axios = require("axios");
const request = require("request");
const constants = require("../config/constants");
const helper = require("../helpers/customFunctions");
const CommonController = require("./CommonController");
const { DB_SCHEMA_NAME: schemaName, FSR_HEADERS, FSR_API_URI } = constants;

const updateStatus = async (studyId, status = "Success") => {
  try {
    if (!studyId) return false;
    const query = `UPDATE ${schemaName}.study set ob_stat='${status}' WHERE prot_id='${studyId}';`;
    const updated = await DB.executeQuery(query);
    if (!updated) return false;
    return true;
  } catch (err) {
    return false;
  }
};

const addOnboardedStudy = async (protNbrStnd, userId) => {
  try {
    if (!protNbrStnd || !userId) return false;
    const result = await DB.executeQuery(
      `SELECT * from ${schemaName}.mdm_study WHERE prot_nbr_stnd='${protNbrStnd}';`
    );
    const study = result.rows[0] || null;
    if (!study) return false;
    const uniqueId = helper.createUniqueID();
    const currentTime = helper.getCurrentTime();
    const userDesc = "mdm study import";
    const valueArr = [
      uniqueId,
      study.prot_nbr,
      study.prot_nbr_stnd,
      study.proj_cd,
      study.phase,
      study.prot_status,
      "In Progress",
      userId,
      userDesc,
      1,
      study.thptc_area,
      currentTime,
      currentTime,
    ];
    const insertQuery = `INSERT INTO ${schemaName}.study
    (prot_id, prot_nbr, prot_nbr_stnd, proj_cd, phase, prot_stat, ob_stat, usr_id, usr_descr, active, thptc_area, insrt_tm, updt_tm, prot_mnemonic_nm)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $3) RETURNING *;`;
    const result1 = await DB.executeQuery(insertQuery, valueArr);
    const insertedStudy = result1.rows[0] || null;
    if (!insertedStudy) return false;
    const sponsorValueArr = [
      uniqueId,
      study.spnsr_nm,
      study.spnsr_nm_stnd,
      "a020E000005SwQSQA0",
      userId,
      userDesc,
      1,
      currentTime,
      currentTime,
    ];
    const insertSponQuery = `INSERT INTO ${schemaName}.sponsor (spnsr_id, spnsr_nm, spnsr_nm_stnd, tenant_id, usr_id, usr_descr, active, insrt_tm, updt_tm, spnsr_mnemonic_nm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $3) ON CONFLICT (spnsr_nm) DO UPDATE SET spnsr_nm=EXCLUDED.spnsr_nm returning *;`;
    const result2 = await DB.executeQuery(insertSponQuery, sponsorValueArr);
    const sponsor = result2.rows[0] || sponsor;
    if (!sponsor) return false;
    const studySposrQuery = `INSERT INTO ${schemaName}.study_sponsor
    (prot_id, spnsr_id)
    VALUES('${insertedStudy.prot_id}', '${sponsor.spnsr_id}');
    `;
    const addedSponsor = await DB.executeQuery(studySposrQuery);
    if (!addedSponsor) return false;
    return insertedStudy;
  } catch (err) {
    return false;
  }
};

exports.cronUpdateStatus = async () => {
  try {
    const query = `SELECT prot_nbr_stnd, prot_id from study WHERE ob_stat='In Progress'`;
    const result = await DB.executeQuery(query);
    if (!result) return false;
    const studies = result.rows || [];
    if (!studies.length) return false;

    await Promise.all(
      studies.map(async (study) => {
        const { prot_id, prot_nbr_stnd } = study;
        const status = await CommonController.fsrStudyStatus(prot_nbr_stnd);
        if (status == "Success") {
          await updateStatus(prot_id);
        }
      })
    );
    Logger.info({
      message: "cronFinished",
    });
    return true;
  } catch {
    return false;
  }
};

exports.onboardStudy = async function (req, res) {
  const {
    sponsorNameStnd: sponsorName,
    protNbrStnd: studyId,
    userId,
    users,
  } = req.body;
  Logger.info({ message: "onboardStudy" });
  axios
    .post(
      `${FSR_API_URI}/study/onboard`,
      {
        sponsorName,
        studyId,
      },
      {
        headers: FSR_HEADERS,
      }
    )
    .then(async (response) => {
      const onboardStatus = response?.data?.code || null;
      if (onboardStatus === 202) {
        const insertedStudy = await addOnboardedStudy(studyId, userId);
        if (!insertedStudy)
          return apiResponse.ErrorResponse(res, "Something went wrong");

        if (users && users.length) {
          let insertQuery = "";
          const currentTime = helper.getCurrentTime();
          users.forEach((user) => {
            if (user.user?.userId && insertedStudy.prot_id) {
              insertQuery += `INSERT into ${schemaName}.study_user (prot_id, usr_id, act_flg, insrt_tm, updt_tm) VALUES('${insertedStudy.prot_id}', '${user.user.userId}', 1, '${currentTime}', '${currentTime}');`;
              if (user.roles && Array.isArray(user.roles)) {
                user.roles.forEach((role) => {
                  insertQuery += `INSERT into ${schemaName}.study_user_role (role_id, prot_id, usr_id, act_flg, created_by, created_on, updated_by, updated_on) VALUES('${role.value}', '${insertedStudy.prot_id}', '${user.user.userId}', 1, '${userId}', '${currentTime}', '${userId}', '${currentTime}');`;
                });
              }
            }
          });
          // console.log("insertQuery", insertQuery, insertedStudy);
          const rolesAdded = await DB.executeQuery(insertQuery);
          if (!rolesAdded)
            return apiResponse.ErrorResponse(res, "Something went wrong");
        }
      }
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
    const searchQuery = `SELECT ms.prot_nbr, ms.prot_nbr_stnd, ms.spnsr_nm, ms.spnsr_nm_stnd, ms.proj_cd, ms.phase, ms.prot_status, ms.thptc_area, s.ob_stat from ${constants.DB_SCHEMA_NAME}.mdm_study ms
    FULL OUTER JOIN ${constants.DB_SCHEMA_NAME}.study s ON ms.prot_nbr = s.prot_nbr
    WHERE (LOWER(ms.prot_nbr) LIKE '%${searchParam}%' OR 
    LOWER(ms.spnsr_nm) LIKE '%${searchParam}%' OR 
    LOWER(ms.proj_cd) LIKE '%${searchParam}%')
    AND ms.spnsr_nm_stnd !='' AND ms.prot_nbr_stnd !=''
        LIMIT 60
        `;
    Logger.info({ message: "studyList" });

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
    left join ${schemaName}.study_sponsor ss on s.prot_id = ss.prot_id 
    left JOIN ${schemaName}.sponsor cs2 ON cs2.spnsr_id = ss.spnsr_id ORDER BY s.insrt_tm`;

    const query2 = `SELECT prot_id, COUNT(DISTINCT usr_id) FROM ${schemaName}.study_user GROUP BY prot_id`;
    const query3 = `SELECT DISTINCT phase FROM ${schemaName}.study`;
    const query4 = `SELECT DISTINCT prot_stat as protocolstatus FROM ${schemaName}.study`;
    const query5 = `SELECT DISTINCT ob_stat as onboardingprogress FROM ${schemaName}.study`;

    Logger.info({ message: "getStudyList" });

    const $q1 = await DB.executeQuery(query);
    const $q2 = await DB.executeQuery(query2);
    const $q3 = await DB.executeQuery(query3);
    const $q4 = await DB.executeQuery(query4);
    const $q5 = await DB.executeQuery(query5);

    const formatDateValues = await $q1.rows.map((e) => {
      let acc = $q2.rows.filter((d) => d.prot_id === e.prot_id);
      let newObj = acc[0] ? acc[0] : { count: 0 };
      let { count } = newObj;
      // let editT = moment(e.dateedited).format("MM/DD/YYYY");
      // let addT = moment(e.dateadded).format("MM/DD/YYYY");
      let newData = _.omit(e, ["prot_id"]);
      return {
        ...newData,
        // dateadded: addT,
        // dateedited: editT,
        assignmentcount: count,
      };
    });

    let uniquePhase = $q3.rows.map((e) => Object.values(e)).flat();
    let uniqueProtocolStatus = $q4.rows.map((e) => Object.values(e)).flat();
    let uniqueObs = $q5.rows.map((e) => Object.values(e)).flat();

    // console.log('rows', $data.rows, formatDateValues);
    return apiResponse.successResponseWithData(res, "Operation success", {
      studyData: formatDateValues,
      uniquePhase: uniquePhase,
      uniqueProtocolStatus: uniqueProtocolStatus,
      uniqueObs: uniqueObs,
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :studyList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getSDAUsers = () => {
  try {
    axios
      .get(
        `${SDA_BASE_URL}/sda-rest-api/api/external/entitlement/V1/ApplicationUsers/getUsersForApplication?appKey=${process.env.SDA_APP_KEY}`
      )
      .then((res) => {
        console.log("res", res);
        return apiResponse.successResponseWithData(
          res,
          "Users retrieved successfully",
          studies[0]
        );
      })
      .catch((err) => {
        console.log("err", err);
        return apiResponse.ErrorResponse(res, err);
      });
  } catch (err) {
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
