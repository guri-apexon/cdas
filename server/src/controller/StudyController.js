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
const { filter } = require("lodash");
const { getTenantIdByNemonicNull } = require("../helpers/studyHelper");
const { DB_SCHEMA_NAME: schemaName, FSR_HEADERS, FSR_API_URI } = constants;
const userHelper = require("../helpers/userHelper");

// const updateStatus = async (studyId, status = "Success") => {
//   try {
//     if (!studyId) return false;
//     const query = `UPDATE ${schemaName}.study set ob_stat='${status}' WHERE prot_id='${studyId}';`;
//     const updated = await DB.executeQuery(query);
//     if (!updated) return false;
//     return true;
//   } catch (err) {
//     return false;
//   }
// };

const addOnboardedStudy = async (protNbrStnd, userId, insrt_tm) => {
  try {
    if (!protNbrStnd || !userId) return false;
    const result = await DB.executeQuery(
      `SELECT * from ${schemaName}.mdm_study WHERE prot_nbr_stnd='${protNbrStnd}';`
    );
    const study = result.rows[0] || null;
    if (!study) return false;
    // const uniqueId = helper.createUniqueID();
    const userDesc = "mdm study import";
    const valueArr = [
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
      insrt_tm,
      insrt_tm,
    ];
    const insertQuery = `INSERT INTO ${schemaName}.study
    (prot_nbr, prot_nbr_stnd, proj_cd, phase, prot_stat, ob_stat, usr_id, usr_descr, active, thptc_area, insrt_tm, updt_tm, prot_mnemonic_nm)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $2) RETURNING *;`;
    const result1 = await DB.executeQuery(insertQuery, valueArr);
    const insertedStudy = result1.rows[0] || null;
    if (!insertedStudy) return false;
    const tenantId = await getTenantIdByNemonicNull();
    const sponsorValueArr = [
      study.spnsr_nm,
      study.spnsr_nm_stnd,
      tenantId,
      userId,
      userDesc,
      1,
      insrt_tm,
      insrt_tm,
    ];
    // const insertSponQuery = `INSERT INTO ${schemaName}.sponsor (spnsr_nm, spnsr_nm_stnd, tenant_id, usr_id, usr_descr, active, insrt_tm, updt_tm, spnsr_mnemonic_nm)
    // VALUES($1, $2, $3, $4, $5, $6, $7, $8, $2) ON CONFLICT (spnsr_mnemonic_nm)
    //  DO UPDATE SET spnsr_nm=EXCLUDED.spnsr_nm,spnsr_nm_stnd=EXCLUDED.spnsr_nm_stnd, usr_id =EXCLUDED.usr_id , updt_tm=EXCLUDED.updt_tm  returning *;`;

    const query_get_sponsor = `SELECT * from ${schemaName}.sponsor where spnsr_mnemonic_nm ='${study.spnsr_nm_stnd}' `;
    const sponsor_exists = await DB.executeQuery(query_get_sponsor);

    let sponsor_query;
    let dataArray = [];
    if (sponsor_exists.rowCount > 0) {
      if (
        sponsor_exists?.rows[0]?.spnsr_nm !== study.spnsr_nm ||
        sponsor_exists?.rows[0]?.spnsr_nm_stnd !== study.spnsr_nm_stnd
      ) {
        // 4 , 8
        sponsor_query = `UPDATE ${schemaName}.sponsor SET spnsr_nm=$1,spnsr_nm_stnd=$2,usr_id=$3,updt_tm=$4  returning * `;
        dataArray = [study.spnsr_nm, study.spnsr_nm_stnd, userId, insrt_tm];
      }
    } else {
      sponsor_query = ` INSERT INTO ${schemaName}.sponsor (spnsr_nm, spnsr_nm_stnd, tenant_id, usr_id, usr_descr, active, insrt_tm, updt_tm, spnsr_mnemonic_nm) 
     VALUES($1, $2, $3, $4, $5, $6, $7, $8, $2) returning *`;
      dataArray = [...sponsorValueArr];
    }

    let sponsor;
    if (sponsor_query) {
      const result2 = await DB.executeQuery(sponsor_query, dataArray);
      sponsor = result2?.rows[0] || sponsor;
      if (!sponsor) return false;
    } else {
      sponsor = sponsor_exists?.rows[0];
    }

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

// exports.cronUpdateStatus = async () => {
//   try {
//     const query = `SELECT prot_nbr_stnd, prot_id from study WHERE ob_stat='In Progress'`;
//     const result = await DB.executeQuery(query);
//     if (!result) return false;
//     const studies = result.rows || [];
//     if (!studies.length) return false;

//     await Promise.all(
//       studies.map(async (study) => {
//         const { prot_id, prot_nbr_stnd } = study;
//         const status = await CommonController.fsrStudyStatus(prot_nbr_stnd);
//         await updateStatus(prot_id);
//       })
//     );
//     Logger.info({
//       message: "cronFinished",
//     });
//     return true;
//   } catch {
//     return false;
//   }
// };

exports.onboardStudy = async function (req, res) {
  try {
    const {
      sponsorNameStnd: sponsorName,
      protNbrStnd: studyId,
      userId,
      users,
      insrt_tm,
      updt_tm,
    } = req.body;
    Logger.info({ message: "onboardStudy" });
    console.log(">>> onboard", req.body);

    const studyExists = await DB.executeQuery(
      `select * from ${schemaName}.study where prot_nbr_stnd = '${studyId}';`
    );
    if (studyExists?.rows?.length) {
      return apiResponse.ErrorResponse(
        res,
        "Study Onboarding request already created for the given StudyId"
      );
    }
    axios
      .post(
        `${FSR_API_URI}/study/onboard`,
        {
          sponsorName,
          studyId,
          rwUsers: process.env.FSR_RW_USERS_KEY,
        },
        {
          headers: FSR_HEADERS,
        }
      )
      .then(async (response) => {
        const onboardStatus = response?.data?.code || null;
        let insertedStudy = null;
        if (onboardStatus === 202 || onboardStatus === 200) {
          const responseData = {
            ...response?.data,
            message:
              "Study onboarding initiated successfully. Please wait for 3 hour(s) to check the status and get the required access reflected in the corresponding environment.",
          };

          try {
            insertedStudy = await addOnboardedStudy(studyId, userId, insrt_tm);
            if (!insertedStudy)
              return apiResponse.ErrorResponse(res, "Something went wrong");
          } catch (error) {
            console.log(">>> onboard - error", error);
            return apiResponse.ErrorResponse(res, "Something went wrong");
          }

          if (users && users.length) {
            let insertQuery = "";
            users.forEach((user) => {
              if (user.user?.userId && insertedStudy.prot_id) {
                const studyUserId = user.user.userId.toLowerCase();
                insertQuery += `INSERT into ${schemaName}.study_user (prot_id, usr_id, act_flg, insrt_tm, updt_tm) VALUES('${insertedStudy.prot_id}', '${studyUserId}', 1, '${insrt_tm}', '${updt_tm}');`;
                if (user.roles && Array.isArray(user.roles)) {
                  user.roles.forEach((role) => {
                    insertQuery += `INSERT into ${schemaName}.study_user_role (role_id, prot_id, usr_id, act_flg, created_by, created_on, updated_by, updated_on) VALUES('${role.value}', '${insertedStudy.prot_id}', '${studyUserId}', 1, '${userId}', '${insrt_tm}', '${userId}', '${updt_tm}');`;
                  });
                }
              }
            });
            DB.executeQuery(insertQuery)
              .then((resp) => {
                // Study audit table audit log entry
                // const studyAudit = CommonController.studyAudit(
                //   insertedStudy.prot_id,
                //   "New Entry",
                //   userId
                // );

                return apiResponse.successResponseWithData(
                  res,
                  "Operation success",
                  responseData
                );
              })
              .catch((err) => {
                return apiResponse.ErrorResponse(
                  res,
                  err.detail || "Something went wrong"
                );
              });
          } else {
            // // Study audit table audit log entry
            // const studyAudit = CommonController.studyAudit(
            //   insertedStudy.prot_id,
            //   "New Entry",
            //   userId
            // );

            return apiResponse.successResponseWithData(
              res,
              "Onboarding successfull",
              responseData
            );
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
    const searchParam = req?.params?.query?.toLowerCase();
    const searchQuery = `SELECT s.prot_id, ms.prot_nbr, ms.prot_nbr_stnd, ms.spnsr_nm, ms.spnsr_nm_stnd, ms.proj_cd,
    ms.phase, ms.prot_status, ms.thptc_area, s.ob_stat from ${schemaName}.mdm_study ms
    left JOIN ${schemaName}.study s ON ms.prot_nbr_stnd = s.prot_nbr_stnd 
    WHERE (LOWER(ms.prot_nbr) LIKE '%${searchParam}%' OR LOWER(ms.spnsr_nm) LIKE '%${searchParam}%' OR LOWER(ms.proj_cd) LIKE '%${searchParam}%')
    AND ms.spnsr_nm_stnd !='' AND ms.prot_nbr_stnd !='' LIMIT 60;`;
    Logger.info({ message: "studyList" });

    DB.executeQuery(searchQuery).then((response) => {
      const studies = response?.rows || [];
      if (studies?.length > 0) {
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
    const query = `   SELECT  s.prot_id, max(prot_nbr) as protocolnumber, max(s.prot_nbr_stnd) as prot_nbr_stnd, max(phase) as phase, 
    max(prot_stat) as protocolstatus,max(spnsr_nm) as sponsorname, max(s.insrt_tm) as dateadded, max(s.updt_tm) as dateedited, 
    max(ob_stat) as onboardingprogress, max(s.usr_descr) as assignmentcount, max(thptc_area) as therapeuticarea,
   max(proj_cd) as projectcode,  count(DISTINCT su.usr_id) usr_cnt
FROM  ${schemaName}.study s 
INNER join  ${schemaName}.study_sponsor ss on s.prot_id = ss.prot_id 
INNER JOIN  ${schemaName}.sponsor cs2 ON cs2.spnsr_id = ss.spnsr_id 
left join  ${schemaName}.study_user su on s.prot_id = su.prot_id and su.act_flg =1
group by s.prot_id 
ORDER BY s.insrt_tm desc
`;

    const query3 = `SELECT DISTINCT phase FROM ${schemaName}.study`;
    const query4 = `SELECT DISTINCT prot_stat as protocolstatus FROM ${schemaName}.study`;
    const query5 = `SELECT DISTINCT ob_stat as onboardingprogress FROM ${schemaName}.study`;
    const query6 = `SELECT DISTINCT thptc_area as therapeuticarea FROM ${schemaName}.study`;

    Logger.info({ message: "getStudyList" });

    const $q1 = await DB.executeQuery(query);
    const $q3 = await DB.executeQuery(query3);
    const $q4 = await DB.executeQuery(query4);
    const $q5 = await DB.executeQuery(query5);
    const $q6 = await DB.executeQuery(query6);

    const formatDateValues = $q1.rows.map((e, i) => {
      if (!e.protocolstatus) {
        e.protocolstatus = "Blank";
      }
      if (!e.phase) {
        e.phase = "Blank";
      }
      return {
        ...e,
        studyIndex: i + 1,
        assignmentcount: e.usr_cnt,
      };
    });
    let uniquePhase = $q3.rows
      .map((e) => Object.values(e))
      .flat()
      .map((el) => {
        if (el === null || el === "") {
          return "Blank";
        }
        return el;
      });
    // .filter((e) => e !== "")
    // .filter((e) => e !== null);
    let uniqueProtocolStatus = $q4.rows
      .map((e) => Object.values(e))
      .flat()
      .map((el) => {
        if (el === null || el === "") {
          return "Blank";
        }
        return el;
      });

    let uniqueObs = $q5.rows
      .map((e) => Object.values(e))
      .flat()
      .filter((e) => e !== null);
    let uniqueThbtcArea = $q6.rows
      .map((e) => Object.values(e))
      .flat()
      .filter((e) => e !== null);
    // console.log(uniquePhase);
    return apiResponse.successResponseWithData(res, "Operation success", {
      studyData: formatDateValues,
      uniquePhase: [...new Set(uniquePhase)],
      uniqueProtocolStatus: [...new Set(uniqueProtocolStatus)],
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
      uniqueRoles: _.uniq(uniqueRoles.flat()),
    });
  } catch (err) {
    Logger.error("catch :listStudyAssign");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.AddStudyAssign = async (req, res) => {
  try {
    const { studyId, protocol, loginId, data, insrt_tm } = req.body;
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
          insrt_tm,
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
    const insertUserQuery = `INSERT INTO ${schemaName}.study_user (prot_id,usr_id,act_flg,insrt_tm, updt_tm)
                              VALUES($1,$2,$3,$4,$4)`;
    const insertRoleQuery = `INSERT INTO ${schemaName}.study_user_role 
                              (role_id,prot_id,usr_id,act_flg,created_by,created_on,updated_on,updated_by)
                              VALUES($1,$2,$3,$4,$5,$6,$6,$5) RETURNING *;`;

    Logger.info({ message: "AddStudyAssign" });

    if (data && data.length) {
      data.forEach(async (element) => {
        try {
          // const studyUserId = element.user_id?.toLowerCase() || null;
          const studyUserId = await userHelper.getExternalUserInternalId(
            element.user_id
          );

          if (studyUserId) {
            await DB.executeQuery(insertUserQuery, [
              protocol,
              studyUserId,
              1,
              insrt_tm,
            ]);

            element.role_id.forEach(async (roleId) => {
              try {
                const {
                  rows: [protUsrRoleId],
                } = await DB.executeQuery(insertRoleQuery, [
                  roleId,
                  protocol,
                  studyUserId,
                  1,
                  loginId,
                  insrt_tm,
                ]);

                // console.log("protUsrRoleId", protUsrRoleId.prot_usr_role_id);

                // // Study roll user audit table audit log entry
                const studyUserAudit = CommonController.studyUserAudit(
                  protUsrRoleId.prot_usr_role_id,
                  "New Entry",
                  null,
                  null,
                  loginId
                );
              } catch (e) {
                console.log(e);
              }
            });

            await DB.executeQuery(
              `UPDATE ${schemaName}.study set updt_tm=$1 WHERE prot_id=$2;`,
              [insrt_tm, protocol]
            );
            // Study audit table audit log entry
            const studyAudit = CommonController.studyAudit(
              protocol,
              "New Entry",
              null,
              null,
              loginId
            );

            return apiResponse.successResponseWithData(
              res,
              "New user added successfully"
            );
          } else {
            try {
              // user_id -- is external id in this case
              let sdaUserDetails = await userHelper.getSDAuserDataById(
                element?.user_id
              );
              const requestBody = {
                appKey: process.env.SDA_APP_KEY,
                userType: "external",
                roleType: sdaUserDetails?.roleType,
                updatedBy: "Admin",
                email: sdaUserDetails?.email,
              };

              let sda_status = {};
              sda_status = await userHelper.deProvisionUser(
                requestBody,
                requestBody.userType
              );
              if (sda_status.status == 200 || sda_status.status == 204) {
                return apiResponse.ErrorResponse(
                  res,
                  "User registeration incomplete"
                );
              }
            } catch (error) {
              return apiResponse.ErrorResponse(
                res,
                "User registeration incomplete"
              );
            }
          }
        } catch (er) {
          return apiResponse.ErrorResponse(res, err);
        }
      });
    }
  } catch (err) {
    console.log(err);
    //throw error in json response with status 500.
    Logger.error("catch :AddStudyAssign");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateStudyAssign = async (req, res) => {
  try {
    const { protocol, loginId, data, updt_tm } = req.body;
    if (!data || !data.length) {
      return apiResponse.ErrorResponse(res, "Something went wrong");
    }

    const curDate = moment().format("YYYY-MM-DD HH:mm:ss");
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

    const roleUpdateQuery = `UPDATE ${schemaName}.study_user_role SET act_flg=0, updated_by=$4,
                        updated_on=$5 WHERE prot_id =$1 and usr_id = $2 and role_id <> ALL ($3);`;

    const roleGetQuery = `SELECT act_flg,prot_usr_role_id FROM ${schemaName}.study_user_role  WHERE prot_id =$1 and usr_id = $2 and role_id = $3`;

    const insertRoleQuery = `INSERT INTO ${schemaName}.study_user_role (role_id,prot_id,usr_id,act_flg,created_by,created_on,updated_on,updated_by)
                            VALUES($1,$2,$3,$4,$5,$6,$6,$5) RETURNING *;`;

    const updateExistingRole = `UPDATE ${schemaName}.study_user_role SET act_flg=1, updated_by=$1, updated_on=$2 WHERE prot_usr_role_id =$3 RETURNING *;`;

    const oldDataQuery = `SELECT act_flg,prot_usr_role_id,role_id FROM ${schemaName}.study_user_role  WHERE prot_id =$1 and usr_id = $2 and act_flg=1`;

    Logger.info({ message: "updateStudyAssign" });

    let roleDetails = [];

    data.forEach(async (element) => {
      try {
        const studyUserId = element.user_id || null;
        const { rows: selectData } = await DB.executeQuery(oldDataQuery, [
          protocol,
          studyUserId,
        ]);

        const deletedRoles = selectData.filter(
          (x) => !element.role_id.includes(x.role_id)
        );

        deletedRoles.forEach((obj) => {
          const studyUserAudit1 = CommonController.studyUserAudit(
            obj.prot_usr_role_id,
            "act_flg",
            1,
            0,
            loginId
          );
        });

        element.role_id.forEach(async (rollID) => {
          try {
            const roleGet = await DB.executeQuery(roleGetQuery, [
              protocol,
              studyUserId,
              rollID,
            ]);

            if (roleGet.rows.length == 0) {
              const {
                rows: [newProtUsrRoleId],
              } = await DB.executeQuery(insertRoleQuery, [
                rollID,
                protocol,
                studyUserId,
                1,
                loginId,
                updt_tm,
              ]);

              // // Study roll user audit table audit log entry
              const studyUserAudit1 = CommonController.studyUserAudit(
                newProtUsrRoleId.prot_usr_role_id,
                "New Entry",
                null,
                null,
                loginId
              );
            } else {
              roleGet.rows.forEach(async (exRecord) => {
                try {
                  if (exRecord.act_flg != 1) {
                    const studyUserAudit1 = CommonController.studyUserAudit(
                      exRecord?.prot_usr_role_id,
                      "act_flg",
                      0,
                      1,
                      loginId
                    );
                  }

                  const { rows: updateData } = await DB.executeQuery(
                    updateExistingRole,
                    [loginId, curDate, exRecord?.prot_usr_role_id]
                  );
                } catch (error) {
                  console.log(error);
                }

                // const idArry = selectData.map((x) => x.prot_usr_role_id);
              });
            }
          } catch (e) {
            console.log(e);
          }
        });

        await DB.executeQuery(roleUpdateQuery, [
          protocol,
          studyUserId,
          element.role_id,
          loginId,
          updt_tm,
        ]);
      } catch (err) {
        console.log(err);
      }
    });

    // console.log("roleData", roleDetails);

    await DB.executeQuery(
      `UPDATE ${schemaName}.study set updt_tm=$1 WHERE prot_id=$2;`,
      [updt_tm, protocol]
    );
    return apiResponse.successResponse(res, "update successfully");
  } catch (err) {
    Logger.error("catch :updateStudyAssign");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.deleteStudyAssign = async (req, res) => {
  try {
    const { studyId, protocol, loginId, users, updt_tm } = req.body;

    if (!users || !users.length) {
      return apiResponse.ErrorResponse(res, "Something went wrong");
    }

    const userDeleteQuery = `UPDATE ${schemaName}.study_user SET act_flg =0,updt_tm=$3 WHERE prot_id =$1 and usr_id = $2`;
    const roleDeleteQuery = `UPDATE ${schemaName}.study_user_role SET act_flg =0,updated_by=$3,updated_on=$4 WHERE prot_id =$1 and usr_id =$2 RETURNING *;`;
    const studyUpdate = `UPDATE ${schemaName}.study SET updt_tm=$2 WHERE prot_id =$1`;
    Logger.info({ message: "deleteStudyAssign" });

    axios
      .post(
        `${FSR_API_URI}/study/revoke`,
        {
          studyId,
          userId: loginId,
          roUsers: users.join(", "),
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
        users.forEach(async (id) => {
          try {
            const studyUserId = id.toLowerCase();
            await DB.executeQuery(userDeleteQuery, [
              protocol,
              studyUserId,
              updt_tm,
            ]);

            await DB.executeQuery(studyUpdate, [protocol, updt_tm]); // Study table timeStamp update

            // Study audit table audit log entry
            const studyAudit = CommonController.studyAudit(
              protocol,
              "act_flg",
              1,
              0,
              loginId
            );

            const {
              rows: [protUsrRoleId],
            } = await DB.executeQuery(roleDeleteQuery, [
              protocol,
              studyUserId,
              loginId,
              updt_tm,
            ]);

            // // Study roll user audit table audit log entry
            const studyUserAudit = CommonController.studyUserAudit(
              protUsrRoleId.prot_usr_role_id,
              "act_flg",
              1,
              0,
              loginId
            );

            return apiResponse.successResponse(
              res,
              "User deleted successfully"
            );
          } catch (err) {
            console.log(err);
          }
        });
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err.response?.data);
      });
  } catch (err) {
    Logger.error("catch :deleteStudyAssign");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
