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
        await updateStatus(prot_id);
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
  try {
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
                const studyUserId = user.user.userId.toLowerCase();
                insertQuery += `INSERT into ${schemaName}.study_user (prot_id, usr_id, act_flg, insrt_tm, updt_tm) VALUES('${insertedStudy.prot_id}', '${studyUserId}', 1, '${currentTime}', '${currentTime}');`;
                if (user.roles && Array.isArray(user.roles)) {
                  user.roles.forEach((role) => {
                    insertQuery += `INSERT into ${schemaName}.study_user_role (role_id, prot_id, usr_id, act_flg, created_by, created_on, updated_by, updated_on) VALUES('${role.value}', '${insertedStudy.prot_id}', '${studyUserId}', 1, '${userId}', '${currentTime}', '${userId}', '${currentTime}');`;
                  });
                }
              }
            });
            DB.executeQuery(insertQuery)
              .then((resp) => {
                return apiResponse.successResponseWithData(
                  res,
                  "Operation success",
                  response?.data
                );
              })
              .catch((err) => {
                return apiResponse.ErrorResponse(
                  res,
                  err.detail || "Something went wrong"
                );
              });
          }
        } else {
          return res.json({ ...response?.data, status: "ERROR" });
        }
      })
      .catch((err) => {
        if (err.response?.data) {
          return res.json(err.response.data);
        } else {
          return apiResponse.ErrorResponse(res, "Something went wrong");
        }
      });
  } catch (_err) {
    return apiResponse.ErrorResponse(res, "Something went wrong");
  }
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
    const query = `SELECT s.prot_id, prot_nbr as protocolnumber, s.prot_nbr_stnd, phase, prot_stat as protocolstatus, spnsr_nm as sponsorname, s.insrt_tm as dateadded, s.updt_tm as dateedited, ob_stat as onboardingprogress, s.usr_descr as assignmentcount, thptc_area as therapeuticarea, proj_cd as projectcode FROM ${schemaName}.study s 
    left join ${schemaName}.study_sponsor ss on s.prot_id = ss.prot_id 
    left JOIN ${schemaName}.sponsor cs2 ON cs2.spnsr_id = ss.spnsr_id ORDER BY s.insrt_tm`;

    const query2 = `SELECT prot_id, COUNT(DISTINCT usr_id) FROM ${schemaName}.study_user GROUP BY prot_id`;
    const query3 = `SELECT DISTINCT phase FROM ${schemaName}.study`;
    const query4 = `SELECT DISTINCT prot_stat as protocolstatus FROM ${schemaName}.study`;
    const query5 = `SELECT DISTINCT ob_stat as onboardingprogress FROM ${schemaName}.study`;
    const query6 = `SELECT DISTINCT thptc_area as therapeuticarea FROM ${schemaName}.study`;

    Logger.info({ message: "getStudyList" });

    const $q1 = await DB.executeQuery(query);
    const $q2 = await DB.executeQuery(query2);
    const $q3 = await DB.executeQuery(query3);
    const $q4 = await DB.executeQuery(query4);
    const $q5 = await DB.executeQuery(query5);
    const $q6 = await DB.executeQuery(query6);
    const formatDateValues = await $q1.rows.map((e) => {
      let acc = $q2.rows.filter((d) => d.prot_id === e.prot_id);
      let newObj = acc[0] ? acc[0] : { count: 0 };
      let { count } = newObj;
      let editT = moment(e.dateedited).format("MM/DD/YYYY");
      let addT = moment(e.dateadded).format("MM/DD/YYYY");
      // let newData = _.omit(e, ["prot_id"]);
      return {
        ...e,
        dateadded: addT,
        dateedited: editT,
        assignmentcount: count,
      };
    });

    let uniquePhase = $q3.rows
      .map((e) => Object.values(e))
      .flat()
      .filter((e) => e !== "")
      .filter((e) => e !== null);
    let uniqueProtocolStatus = $q4.rows
      .map((e) => Object.values(e))
      .flat()
      .filter((e) => e !== null);
    let uniqueObs = $q5.rows
      .map((e) => Object.values(e))
      .flat()
      .filter((e) => e !== null);
    let uniqueThbtcArea = $q6.rows
      .map((e) => Object.values(e))
      .flat()
      .filter((e) => e !== null);

    return apiResponse.successResponseWithData(res, "Operation success", {
      studyData: formatDateValues,
      uniquePhase: uniquePhase,
      uniqueProtocolStatus: uniqueProtocolStatus,
      uniqueObs: uniqueObs,
      uniqueThbtcArea,
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

exports.listStudyAssign = async (req, res) => {
  try {
    const protocol = req.body.protocol;
    const getQuery = `SELECT t1.prot_id,t1.usr_id,t2.usr_fst_nm,t2.usr_lst_nm,t2.usr_mail_id 
                        FROM ${schemaName}.study_user as t1 
                        LEFT JOIN ${schemaName}.user as t2 ON t1.usr_id = t2.usr_id 
                        where t1.prot_id =$1 and t1.act_flg =1 and t1.usr_id is NOT NULL`;
    const getRole = `SELECT t1.role_id,t1.prot_id,t1.usr_id,t2.role_nm ,t2.role_desc 
                      FROM ${schemaName}.study_user_role as t1
                      LEFT JOIN ${schemaName}.role as t2 ON t1.role_id = t2.role_id
                      where t1.prot_id =$1 and t1.usr_id=$2 and t1.act_flg =1 order by t2.role_nm`;

    Logger.info({ message: "listStudyAssign" });
    const uniqueRoles = [];
    const list = await DB.executeQuery(getQuery, [protocol]);
    for (const item of list.rows) {
      let roles = await DB.executeQuery(getRole, [protocol, item.usr_id]);
      item.roles = roles.rows;
      let flatten = roles.rows.map((e) => e.role_nm);
      item.roleList = flatten;
      uniqueRoles.push(flatten);
    }

    return apiResponse.successResponseWithData(res, "Operation success", {
      list: list.rows,
      uniqueRoles: uniqueRoles.flat(),
    });
  } catch (err) {
    Logger.error("catch :listStudyAssign");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.AddStudyAssign = async (req, res) => {
  try {
    const { studyId, protocol, loginId, data } = req.body;
    const curDate = helper.getCurrentTime();
    if (!data || !data.length) {
      return apiResponse.ErrorResponse(res, "Something went wrong");
    }
    const roUsers = data.map((e) => e.user_id).join(", ");

    axios
      .post(
        `${FSR_API_URI}/study/grant`,
        {
          studyId,
          userId: loginId,
          roUsers,
        },
        {
          headers: FSR_HEADERS,
        }
      )
      .then(async (response) => {
        const onboardStatus = response?.data?.code || null;
        if (onboardStatus === 202) {
          Logger.info({ message: "FSR API update" });
        }
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err);
      });

    const insertUserQuery = `INSERT INTO ${schemaName}.study_user (prot_id,usr_id,act_flg,insrt_tm)
                              VALUES($1,$2,$3,$4)`;
    const insertRoleQuery = `INSERT INTO ${schemaName}.study_user_role 
                              (role_id,prot_id,usr_id,act_flg,created_by,created_on)
                              VALUES($1,$2,$3,$4,$5,$6)`;

    Logger.info({ message: "AddStudyAssign" });

    if (data && data.length) {
      data.forEach(async (element) => {
        try {
          const studyUserId = element.user_id?.toLowerCase() || null;
          await DB.executeQuery(insertUserQuery, [
            protocol,
            studyUserId,
            1,
            curDate,
          ]);

          element.role_id.forEach(async (roleId) => {
            try {
              await DB.executeQuery(insertRoleQuery, [
                roleId,
                protocol,
                studyUserId,
                1,
                loginId,
                curDate,
              ]);
            } catch (e) {
              console.log(e);
            }
          });
        } catch (err) {
          console.log(err);
        }
      });
      return apiResponse.successResponseWithData(
        res,
        "New user Added successfully"
      );
    }
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :AddStudyAssign");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateStudyAssign = async (req, res) => {
  try {
    const { protocol, loginId, data } = req.body;
    const curDate = helper.getCurrentTime();
    if (!data || !data.length) {
      return apiResponse.ErrorResponse(res, "Something went wrong");
    }
    // We are not use roles in FRS API so commented

    // const roUsers = data.map((e) => e.user_id).join(", ");
    // axios
    //   .post(
    //     `${FSR_API_URI}/study/grant`,
    //     {
    //       studyId: protocol,
    //       userId: loginId,
    //       roUsers,
    //     },
    //     {
    //       headers: FSR_HEADERS,
    //     }
    //   )
    //   .then(async (response) => {
    //     const onboardStatus = response?.data?.code || null;
    //     if (onboardStatus === 202) {
    //       Logger.info({ message: "FSR API update" });
    //     }
    //   })
    //   .catch((err) => {
    //     return apiResponse.ErrorResponse(res, err);
    //   });

    const roleUpdateQuery = `UPDATE ${schemaName}.study_user_role SET act_flg =0,updated_by=$4,
                        updated_on=$5 WHERE prot_id =$1 and usr_id = $2 and role_id <> ALL ($3);`;

    const roleGetQuery = `SELECT * FROM ${schemaName}.study_user_role  WHERE prot_id =$1 and usr_id = $2 and role_id = $3`;

    const insertRoleQuery = `INSERT INTO ${schemaName}.study_user_role (role_id,prot_id,usr_id,act_flg,created_by,created_on)
                            VALUES($1,$2,$3,$4,$5,$6)`;

    Logger.info({ message: "updateStudyAssign" });

    data.forEach(async (element) => {
      try {
        const studyUserId = element.user_id?.toLowerCase() || null;
        await DB.executeQuery(roleUpdateQuery, [
          protocol,
          studyUserId,
          element.role_id,
          loginId,
          curDate,
        ]);

        element.role_id.forEach(async (rollID) => {
          try {
            const roleGet = await DB.executeQuery(roleGetQuery, [
              protocol,
              studyUserId,
              rollID,
            ]);

            if (roleGet.rows.length == 0) {
              await DB.executeQuery(insertRoleQuery, [
                rollID,
                protocol,
                studyUserId,
                1,
                loginId,
                curDate,
              ]);
            }
          } catch (e) {
            console.log(e);
          }
        });
      } catch (err) {
        console.log(err);
      }
    });
    return apiResponse.successResponse(res, "update successfully");
  } catch (err) {
    Logger.error("catch :updateStudyAssign");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.deleteStudyAssign = async (req, res) => {
  try {
    const { studyId, protocol, loginId, users } = req.body;
    const curDate = helper.getCurrentTime();

    if (!users || !users.length) {
      return apiResponse.ErrorResponse(res, "Something went wrong");
    }

    const userDeleteQuery = `UPDATE ${schemaName}.study_user SET act_flg =0,updt_tm=$3 WHERE prot_id =$1 and usr_id = $2`;
    const roleDeleteQuery = `UPDATE ${schemaName}.study_user_role SET act_flg =0,updated_by=$3,updated_on=$4 WHERE prot_id =$1 and usr_id =$2`;
    Logger.info({ message: "deleteStudyAssign" });

    axios
      .post(
        `${FSR_API_URI}/study/revoke`,
        {
          studyId,
          userId: loginId,
          roUser: users.join(", "),
        },
        {
          headers: FSR_HEADERS,
        }
      )
      .then(async (response) => {
        const onboardStatus = response?.data?.code || null;
        if (onboardStatus === 202) {
          Logger.info({ message: "FSR API update" });
        }
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err);
      });

    users.forEach(async (id) => {
      try {
        const studyUserId = id.toLowerCase();
        await DB.executeQuery(userDeleteQuery, [
          protocol,
          studyUserId,
          curDate,
        ]);

        await DB.executeQuery(roleDeleteQuery, [
          protocol,
          studyUserId,
          loginId,
          curDate,
        ]);

        return apiResponse.successResponse(res, "User Deleted successfully");
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    Logger.error("catch :deleteStudyAssign");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
