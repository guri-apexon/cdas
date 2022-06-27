const DB = require("../config/db");
const { getCurrentTime, validateEmail } = require("../helpers/customFunctions");
const Logger = require("../config/logger");
const axios = require("axios");
const userHelper = require("../helpers/userHelper");
const studyHelper = require("../helpers/studyHelper");
const tenantHelper = require("../helpers/tenantHelper");
const apiResponse = require("../helpers/apiResponse");
const constants = require("../config/constants");
const AssignmentController = require("../controller/AssignmentController");

const { DB_SCHEMA_NAME: schemaName } = constants;

const logQuery = `INSERT INTO ${schemaName}.audit_log (tbl_nm,id,attribute,old_val,new_val,rsn_for_chg,updated_by,updated_on) values ($1, $2, $3, $4, $5, $6, $7, $8)`;

exports.getUser = function (user_id) {
  try {
    const usrId = user_id;
    return DB.executeQuery(
      `SELECT * from ${schemaName}.user where usr_id = '${usrId}';`
    ).then((response) => {
      const users = response.rows || [];
      return users?.length ? users[0] : false;
    });
  } catch (err) {
    return false;
  }
};

exports.addUser = function (userDetails) {
  try {
    const { usr_id, usr_fst_nm, usr_lst_nm, usr_mail_id, insrt_tm, updt_tm } =
      userDetails;
    const query = `INSERT INTO ${schemaName}.user(usr_id, usr_fst_nm, usr_lst_nm, usr_mail_id, insrt_tm, updt_tm) VALUES('${usr_id}', '${usr_fst_nm}', '${usr_lst_nm}', '${usr_mail_id}', '${insrt_tm}', '${updt_tm}')`;
    return DB.executeQuery(query).then((response) => {
      return response.rowCount;
    });
  } catch (err) {
    //throw error in json response with status 500.
    return err;
  }
};

exports.getLastLoginTime = function (user_id) {
  try {
    const usrId = user_id;
    return DB.executeQuery(
      `SELECT login_tm from ${schemaName}.user_login_details where usr_id = '${usrId}' order by login_tm desc LIMIT 1;`
    ).then((response) => {
      const login = response.rows || [];
      return login?.length && login[0]?.login_tm ? login[0]?.login_tm : false;
    });
  } catch (err) {
    //throw error in json response with status 500.
    return err;
  }
};

exports.addLoginActivity = async (loginDetails) => {
  try {
    const { usrId, logout_tm } = loginDetails;
    const loginTime = getCurrentTime(true);
    const { rows } = await DB.executeQuery(
      `SELECT * from ${schemaName}.user_login_details WHERE usr_id='${usrId}'`
    );
    let query = "";
    if (rows.length) {
      query = `UPDATE ${schemaName}.user_login_details set login_tm='${loginTime}', logout_tm='${logout_tm}' WHERE usr_id='${usrId}'`;
    } else {
      query = `INSERT INTO ${schemaName}.user_login_details(usr_id, login_tm, logout_tm) VALUES('${usrId}', '${loginTime}', '${logout_tm}')`;
    }
    return DB.executeQuery(query).then((response) => {
      return response.rowCount;
    });
  } catch (err) {
    console.log(err, "inser terr");
    //throw error in json response with status 500.
    return err;
  }
};

exports.listUsers = async function (req, res) {
  try {
    return await DB.executeQuery(
      `SELECT *, CASE WHEN LOWER(TRIM(usr_stat)) IN ('in active', 'inactive') THEN 'Inactive' WHEN LOWER(TRIM(usr_stat)) IN ('active') THEN 'Active' WHEN LOWER(TRIM(usr_stat)) IN ('invited') THEN 'Invited' WHEN usr_stat IS NULL THEN 'Active' ELSE TRIM(usr_stat) END AS formatted_stat, TRIM(usr_stat) AS trimed_usr_stat,  CONCAT(TRIM(usr_fst_nm),' ',TRIM(usr_lst_nm)) AS usr_full_nm, CASE WHEN LOWER(usr_typ)='internal' THEN usr_id ELSE extrnl_emp_id END AS formatted_emp_id from ${schemaName}.user`
    )
      .then((response) => {
        return apiResponse.successResponseWithData(
          res,
          "User retrieved successfully",
          response
        );
      })
      .catch((err) => {
        console.log({ err });
        return apiResponse.ErrorResponse(
          response,
          err.detail || "Something went wrong"
        );
      });
  } catch (err) {
    return false;
  }
};

exports.getUserDetail = async function (req, res) {
  const userId = req.query.userId;
  try {
    return await DB.executeQuery(
      `SELECT u.*, ut.tenant_id from ${schemaName}.user u left join ${schemaName}.user_tenant ut on ut.usr_id = u.usr_id WHERE u.usr_id='${userId}'`
    )
      .then((response) => {
        const user = response?.rows?.[0] || {};
        return apiResponse.successResponseWithData(
          res,
          "User retrieved successfully",
          user
        );
      })
      .catch((err) => {
        console.log({ err });
        return apiResponse.ErrorResponse(
          response,
          err.detail || "Something went wrong"
        );
      });
  } catch (err) {
    return false;
  }
};

exports.getUserStudy = async function (req, res) {
  try {
    const studyUserId = req.query.studyUserId;
    return await DB.executeQuery(
      `SELECT * from ${schemaName}.study_user WHERE usr_id='${studyUserId}'`
    )
      .then((response) => {
        return apiResponse.successResponseWithData(
          res,
          "User retrieved successfully",
          response
        );
      })
      .catch((err) => {
        console.log({ err });
        return apiResponse.ErrorResponse(
          response,
          err.detail || "Something went wrong"
        );
      });
  } catch (err) {
    return false;
  }
};

exports.isUserExists = async (req, res) => {
  const data = req.body;
  Logger.info({ message: "is user exists- begin" });
  const user = await userHelper.isUserExists(data.email);
  if (user) {
    return apiResponse.successResponseWithData(res, "Email validated", {
      taken: true,
      error: "Email address already in system",
    });
  }
  return apiResponse.successResponseWithData(res, "Email validated", {
    taken: false,
    error: "",
  });
};

exports.inviteExternalUser = async (req, res) => {
  const newReq = { ...req, returnBool: true };
  newReq.body["userType"] = "external";
  Logger.info({ message: "inviteExternalUser - begin" });

  // Fetch First Tenant
  const tenant = await tenantHelper.getFirstTenant();
  if (tenant) {
    newReq.body["tenant"] = tenant.tenant_nm;
  } else {
    return apiResponse.ErrorResponse(res, "Unable to fetch tenant");
  }

  const response = await this.createNewUser(newReq, res);
  if (response) {
    const assignmentResponse = AssignmentController.assignmentCreate(
      newReq,
      res
    );
    if (assignmentResponse) {
      return apiResponse.successResponse(
        res,
        `An invitation has been emailed to ${newReq.body.email}`
      );
    }
  }

  return apiResponse.ErrorResponse(
    res,
    "Unable to add new user – please try again or report problem to the system administrator"
  );
};
exports.inviteInternalUser = async (req, res) => {
  // { , , firstName, lastName, email, uid, employeeId }
  const newReq = { ...req, returnBool: true };
  newReq.body["userType"] = "internal";
  Logger.info({ message: "inviteInternalUser - begin" });

  // Fetch First Tenant
  const tenant = await tenantHelper.getFirstTenant();
  if (tenant) {
    newReq.body["tenant"] = tenant.tenant_nm;
  } else {
    return apiResponse.ErrorResponse(res, "Unable to fetch tenant");
  }

  const response = await this.createNewUser(newReq, res);
  if (response) {
    const assignmentResponse = AssignmentController.assignmentCreate(
      newReq,
      res
    );
    if (assignmentResponse) {
      return apiResponse.successResponse(
        res,
        `A new user ${newReq.body.firstName} ${newReq.body.lastName} has been added`
      );
    }
  }
  return apiResponse.ErrorResponse(
    res,
    "Unable to add new user – please try again or report problem to the system administrator"
  );
};

exports.sendInvite = async (req, res) => {
  const newReq = { ...req };
  Logger.info({ message: "sendInvite - begin" });

  const provision_response = await userHelper.provisionExternalUser(
    newReq.body
  );

  if (provision_response) {
    const uid = newReq.body.uid;
    const currentTime = getCurrentTime();
    const query = `UPDATE ${schemaName}.user SET invt_sent_tm='${currentTime}' WHERE usr_id = '${uid}'`;
    try {
      const result = await DB.executeQuery(query);
      return apiResponse.successResponseWithData(
        res,
        `An invitation has been sent to ${newReq.body.email}`,
        currentTime
      );
    } catch (error) {
      console.log("error: sendInvite user update", error);
    }
  }
  return apiResponse.ErrorResponse(
    res,
    "Unable to inviation to user – please try again or report problem to the system administrator"
  );
};

exports.createNewUser = async (req, res) => {
  const data = req.body;
  const { returnBool } = req;

  Logger.info({ message: "create user - begin" });

  // validate data
  const validate = await userHelper.validateCreateUserData(data);
  if (validate.success === false)
    return returnBool
      ? false
      : apiResponse.ErrorResponse(res, validate.message);

  // validate tenant
  const tenant_id = await tenantHelper.findByName(data.tenant);
  if (!tenant_id)
    return returnBool
      ? false
      : apiResponse.ErrorResponse(res, "Tenant does not exists");

  // provision into SDA and save
  const user = await userHelper.findByEmail(data.email);
  let usr_id = (user && user.usr_id) || "";
  let usr_stat = (user && user.usr_stat) || "";

  if (user?.isActive || user?.isInvited)
    return returnBool
      ? false
      : apiResponse.ErrorResponse(res, "User already exists in the database");

  if (data.userType === "internal") {
    const provision_response = await userHelper.provisionInternalUser(data);
    if (provision_response) {
      if (usr_stat === userHelper.CONSTANTS.INACTIVE)
        usr_id = await userHelper.makeUserActive(usr_id, usr_id);
      else
        usr_id = await userHelper.insertUserInDb({
          ...data,
          invt_sent_tm: null,
          insrt_tm: data.insrt_tm || getCurrentTime(),
          updt_tm: data.updt_tm || getCurrentTime(),
          status: "Active",
          externalId: data.uid,
        });
    } else {
      return returnBool
        ? false
        : apiResponse.ErrorResponse(
            res,
            "An error occured while provisioning internal user"
          );
    }
  } else {
    const provision_response = await userHelper.provisionExternalUser(data);
    if (provision_response) {
      if (usr_stat === userHelper.CONSTANTS.INACTIVE)
        usr_id = await userHelper.makeUserActive(
          usr_id,
          provision_response.data
        );
      else
        usr_id = await userHelper.insertUserInDb({
          ...data,
          invt_sent_tm: data.invt_sent_tm || getCurrentTime(),
          insrt_tm: data.insrt_tm || getCurrentTime(),
          updt_tm: data.updt_tm || getCurrentTime(),
          status: "Invited",
          uid: "",
          externalId: data?.employeeId,
          userKey: provision_response.data,
        });
    } else {
      return returnBool
        ? false
        : apiResponse.ErrorResponse(
            res,
            "An error occured while provisioning external user"
          );
    }
  }
  if (!usr_id)
    return returnBool
      ? false
      : apiResponse.ErrorResponse(
          res,
          "An error occured while inserting the user"
        );

  if (usr_id && tenant_id) tenantHelper.insertTenantUser(usr_id, tenant_id);
  else
    return returnBool
      ? false
      : apiResponse.ErrorResponse(
          res,
          "An error occured while entering user and tenant detail"
        );
  return returnBool
    ? true
    : apiResponse.successResponseWithData(res, "User successfully created");
};

exports.getADUsers = async (req, res) => {
  const data = req.body;
  Logger.info({ message: "getADUsers - begin" });

  const { query = "" } = data;
  const users = await userHelper.getUsersFromAD(query);
  if (users) {
    return apiResponse.successResponseWithData(
      res,
      "AD Users retrieved successfully",
      users
    );
  }
  return apiResponse.ErrorResponse(
    res,
    "An error occured while fetching ad users"
  );
};

exports.deleteNewUser = async (req, res) => {
  try {
    const { tenant_id, user_type, email_id, user_id, updt_tm, updated_by } =
      req.body;
    if (tenant_id && user_type && email_id) {
      if (validateEmail(email_id)) {
        const inActiveUserQuery = ` UPDATE ${schemaName}.user set usr_stat=$1 , updt_tm=$2 WHERE usr_mail_id='${email_id}'`;
        const studyStatusUpdateQuery = `UPDATE ${schemaName}.study_user set act_flg=0 , updt_tm='${updt_tm}' WHERE usr_id='${user_id}'`;
        const getStudiesQuery = `SELECT * from ${schemaName}.study WHERE usr_id='${user_id}'`;

        const isUserExists = await userHelper.isUserExists(email_id);
        if (isUserExists) {
          const user = await userHelper.findByEmail(email_id);

          // SDA
          if (user?.isActive) {
            const userDetails = await userHelper.getSDAuserDataById(user_id);

            const requestBody = {
              appKey: process.env.SDA_APP_KEY,
              userType: user_type,
              roleType: userDetails?.roleType,
              networkId: user_id,
              updatedBy: "Admin",
              email: email_id,
            };

            let sda_status = {};
            sda_status = await userHelper.deProvisionUser(
              requestBody,
              user_type
            );

            if (sda_status.status !== 200 && sda_status.status !== 204) {
              return apiResponse.ErrorResponse(
                res,
                "An error occured during user delete in SDA"
              );
            }

            //CDAS Assignments Update
            let studyStatusUpdate = {};

            if (sda_status.status === 204 || sda_status.status === 200) {
              studyStatusUpdate = await DB.executeQuery(studyStatusUpdateQuery);
              if (studyStatusUpdate.rowCount === 0) {
                return apiResponse.ErrorResponse(
                  res,
                  "An error occured while updating study status"
                );
              }
            }

            //CDAS User Update
            let inActiveStatus = {};
            if (studyStatusUpdate.rowCount > 0) {
              inActiveStatus = await DB.executeQuery(inActiveUserQuery, [
                "InActive",
                updt_tm,
              ]);
              if (inActiveStatus.rowCount === 0) {
                return apiResponse.ErrorResponse(
                  res,
                  "An error occured while updating user status"
                );
              }
            }

            // FSR
            let fsr_status = {};
            if (inActiveStatus.rowCount > 0) {
              if (user_type == "internal") {
                const studyData = await DB.executeQuery(getStudiesQuery);
                const fsr_requestBody = {
                  userId: user_id,
                  roUsers: user_id,
                  rwUsers: user_id,
                };
                fsr_status = await userHelper.revokeStudy(
                  fsr_requestBody,
                  studyData?.rows
                );
                if (fsr_status === false) {
                  return apiResponse.ErrorResponse(
                    res,
                    "FSR Revoke internal API Failed "
                  );
                }
              }
            }

            //CDAS Audit
            if (fsr_status !== false) {
              const audit_log = await DB.executeQuery(logQuery, [
                "user",
                user_id,
                "usr_stat",
                "Active",
                "InActive",
                "User Requested",
                updated_by,
                updt_tm,
              ]);
              if (audit_log.rowCount > 0) {
                return apiResponse.successResponse(
                  res,
                  "User Deleted Successfully"
                );
              } else {
                return apiResponse.ErrorResponse(
                  res,
                  "An error occured during audit log updation"
                );
              }
            }
          } else {
            return apiResponse.ErrorResponse(
              res,
              "User is already in inactive status"
            );
          }
        } else {
          return apiResponse.ErrorResponse(res, "User does not exists");
        }
      } else {
        return apiResponse.ErrorResponse(res, "Email id invalid");
      }
    } else {
      return apiResponse.ErrorResponse(res, "Required fields are missing");
    }
  } catch (err) {
    console.log(err, "unable to delete user");
    //throw error in json response with status 500.
    return err;
  }
};

exports.secureApi = async (req, res) => {
  const { userId } = req.body;
  return apiResponse.successResponse(res, "Secure Api Success");
};

const getUserStudyRoles = async (prot_id, userId) => {
  const userRolesQuery = `SELECT r.role_nm AS label, r.role_id AS value from ${schemaName}.study_user_role AS sur LEFT JOIN ${schemaName}.role AS r ON sur.role_id=r.role_id WHERE sur.prot_id='${prot_id}' AND sur.usr_id='${userId}'`;
  return await DB.executeQuery(userRolesQuery).then((res) => res.rows);
};

exports.getUserStudyAndRoles = async function (req, res) {
  try {
    const userId = req.query.userId;
    const userStudyQuery = `SELECT s.prot_id, s.prot_nbr_stnd from ${schemaName}.study_user AS su LEFT JOIN ${schemaName}.study AS s ON su.prot_id=s.prot_id WHERE su.usr_id='${userId}' AND act_flg=1`;
    const userStudies = await DB.executeQuery(userStudyQuery).then(
      (response) => {
        return response.rows;
      }
    );
    await Promise.all(
      userStudies.map(async (e, i) => {
        const roles = await getUserStudyRoles(e.prot_id, userId);
        userStudies[i].roles = roles;
      })
    );
    return apiResponse.successResponseWithData(
      res,
      "User Study and roles retrieved successfully",
      userStudies
    );
  } catch (err) {
    return false;
  }
};

// exports.updateUserStatus = async function (req, res) {
//   try {
//     const userId = req.body.userId;
//     const userStatus = req.body.status;
//     const updt_tm = getCurrentTime(true);
//     const inActiveUserQuery = `UPDATE ${schemaName}.user set usr_stat=$1, updt_tm=$2 WHERE usr_id='${userId}'`;
//     console.log({ inActiveUserQuery });
//     const userStudies = await DB.executeQuery(inActiveUserQuery, [
//       userStatus,
//       updt_tm,
//     ]).then((response) => {
//       return response;
//     });
//     return apiResponse.successResponseWithData(
//       res,
//       "User status updated successfully",
//       userStudies
//     );
//   } catch (err) {
//     return false;
//   }

//  const returnBool = true;

//  if (user_type === "internal") {
//    const provision_response = await userHelper.provisionInternalUser(dataObj);

//    console.log("res", provision_response);
//    if (provision_response) {
//      if (changed_to === userHelper.CONSTANTS.INACTIVE)
//        user_id = await userHelper.makeUserActive(user_id, user_id);
//      else
//        user_id = await userHelper.insertUserInDb({
//          ...dataObj,
//          invt_sent_tm: null,
//          insrt_tm: getCurrentTime(),
//          updt_tm: getCurrentTime(),
//          status: "Active",
//          externalId: dataObj.uid,
//          userKey: provision_response.data,
//        });
//    } else {
//      return returnBool
//        ? false
//        : apiResponse.ErrorResponse(
//            res,
//            "An error occured while provisioning internal user"
//          );
//    }
//  } else {
//    const provision_response = await userHelper.provisionExternalUser(dataObj);
//    if (provision_response) {
//      if (changed_to === userHelper.CONSTANTS.INACTIVE)
//        user_id = await userHelper.makeUserActive(
//          user_id,
//          provision_response.data
//        );
//      else
//        user_id = await userHelper.insertUserInDb({
//          ...dataObj,
//          invt_sent_tm: getCurrentTime(),
//          insrt_tm: getCurrentTime(),
//          updt_tm: getCurrentTime(),
//          status: "Invited",
//          uid: "",
//          externalId: data.uid,
//          userKey: provision_response.data,
//        });
//    } else {
//      return returnBool
//        ? false
//        : apiResponse.ErrorResponse(
//            res,
//            "An error occured while provisioning external user"
//          );
//    }
//  }
// };

exports.updateUserStatus = async (req, res) => {
  const {
    tenant_id,
    user_type,
    email_id,
    user_id,
    firstName,
    lastName,
    changed_to,
    updatedBy,
  } = req.body;
  console.log(req.body);
  const newReq = { ...req, returnBool: true };
  Logger.info({ message: "changeStatus - begin" });

  const userStatus = newReq.body["changed_to"];
  newReq.body["updt_tm"] = getCurrentTime(true);

  try {
    if (userStatus === "inactive") {
      // Fetch First Tenant fi tenant id not present
      if (!newReq?.body?.tenant_id) {
        const tenant = await tenantHelper.getFirstTenant();
        newReq.body["tenant_id"] = tenant.tenant_id;
      }

      const response = await this.deleteNewUser(newReq, res);
    } else if (userStatus === "active") {
      const data = {
        uid: user_id,
        firstName: firstName,
        lastName: lastName,
        emai: email_id,
        updatedBy: updatedBy,
        userType: user_type,
      };
      let returnRes = [];
      const provision_response = await userHelper.provisionInternalUser(data);
      if (provision_response) {
        const {
          rows: [getStudies],
        } = await DB.executeQuery(
          `SELECT * from ${schemaName}.study_user WHERE usr_id='${user_id}' order by updt_tm desc limit 1`
        );

        const studyId = getStudies.prot_id;
        const createdOn = getCurrentTime(true);

        const grantStudy = await studyHelper.studyGrant(
          studyId,
          user_id,
          updatedBy,
          createdOn
        );

        if (grantStudy) {
          const {
            rows: [inactiveStudies],
          } = await DB.executeQuery(
            `SELECT prot_id from ${schemaName}.study_user WHERE act_flg =0 and usr_id='${user_id}'`
          );

          for (let id of inactiveStudies.prot_id) {
            returnRes.study = { studyId: id };

            const {
              rows: [roleId],
            } = await DB.executeQuery(
              `SELECT role_id from ${schemaName}.study_role WHERE prot_id='${id}'`
            );

            const {
              rows: [roleDetails],
            } = await DB.executeQuery(
              `SELECT * from ${schemaName}.role WHERE role_id='${roleId.role_id}'`
            );
            returnRes.roleDetails = { ...roleDetails };
          }
        }

        const auditInsert = `INSERT INTO ${schemaName}.audit_log
              (tbl_nm, id, attribute, old_val, new_val, rsn_for_chg, updated_by, updated_on)
              VALUES($1, $2, $3, $4, $5, $6, $7, $8) `;

        const insert = await DB.executeQuery(auditInsert, [
          "study_user",
          studyId,
          "act_flg",
          0,
          1,
          "null",
          updatedBy,
          createdOn,
        ]);

        if (insert) {
          return apiResponse.successResponseWithData(
            res,
            "This study active successfully",
            returnRes
          );
        }
      }
    }
  } catch (err) {
    console.log({ err });
    return apiResponse.ErrorResponse(newReq, "changeStatus: failed");
  }
};

exports.checkInvitedStatus = async () => {
  try {
    const statusCase = `LOWER(TRIM(usr_stat))`;
    const query = `SELECT usr_id as uid, usr_mail_id as email, extrnl_emp_id as employee_id, usr_typ as user_type, sda_usr_key as user_key, ${statusCase} as status from ${schemaName}.user where (${statusCase} = 'invited')`;
    const result = await DB.executeQuery(query);
    if (!result) return false;

    const invitedUsers = result.rows || [];
    if (!invitedUsers.length) return false;

    // Get Active Users from SDA API
    const activeUsers = userHelper.getSDAUsers();

    await Promise.all(
      invitedUsers.map(async (invitedUser) => {
        const {
          email,
          status,
          user_key: userKey,
          employee_id: employeeId = "",
          uid,
        } = invitedUser;

        if (status === "invited") {
          const SDAStatus = await userHelper.getSDAUserStatus(userKey, email);
          if (SDAStatus) {
            console.log(`*mariking invited ${email} as active`);
            userHelper.makeUserActive(uid, employeeId);
          } else {
            const user = activeUsers.find(
              (u) => u.email.toUpperCase() === email.toUpperCase()
            );
            if (user) {
              console.log(`-mariking invited ${email} as active`);
              userHelper.makeUserActive(uid, employeeId);
            }
          }
        } else {
          console.log("Error, received user who is not invited.", invitedUser);
        }
        return Promise.resolve(true);
      })
    );

    Logger.info({
      message: "checkInvitedStatusCronFinished",
    });

    return true;
  } catch {
    return false;
  }
};

exports.updateUserAssignments = async (req, res) => {
  const newReq = { ...req };
  // console.log({ newReq });
  const query = `SELECT tenant_nm FROM ${schemaName}.tenant LIMIT 1`;
  try {
    const result = await DB.executeQuery(query);
    if (result.rowCount > 0) {
      newReq.body["tenant"] = result.rows[0].tenant_nm;
    } else {
      return apiResponse.ErrorResponse(res, "Tenant does not exists");
    }
  } catch (error) {
    return apiResponse.ErrorResponse(res, "Unable to fetch tenant");
  }
  newReq.body["createdBy"] = newReq.body.userId;
  newReq.body["createdOn"] = getCurrentTime();

  const assignmentResponse = AssignmentController.assignmentUpdate(
    newReq,
    res,
    true
  );
  assignmentResponse.then((e) => console.log({ e }));
  if (assignmentResponse) {
    return apiResponse.successResponse(
      res,
      `Assignments Updated Successfully.`
    );
  }
  return apiResponse.ErrorResponse(
    res,
    "Unable to add upate assignments – please try again or report problem to the system administrator"
  );
};

exports.deleteUserAssignments = async (req, res) => {
  const newReq = { ...req };
  // console.log({ newReq });
  const query = `SELECT tenant_nm FROM ${schemaName}.tenant LIMIT 1`;
  try {
    const result = await DB.executeQuery(query);
    if (result.rowCount > 0) {
      newReq.body["tenant"] = result.rows[0].tenant_nm;
    } else {
      return apiResponse.ErrorResponse(res, "Tenant does not exists");
    }
  } catch (error) {
    return apiResponse.ErrorResponse(res, "Unable to fetch tenant");
  }
  newReq.body["createdBy"] = req.body.updatedBy;
  newReq.body["updatedBy"] = req.body.updatedBy;
  newReq.body["createdOn"] = getCurrentTime();

  const assignmentResponse = AssignmentController.assignmentRemove(
    newReq,
    res,
    true
  );
  assignmentResponse.then((e) => console.log({ e }));
  if (assignmentResponse) {
    return apiResponse.successResponse(
      res,
      `Assignments Updated Successfully.`
    );
  }
  return apiResponse.ErrorResponse(
    res,
    "Unable to add upate assignments – please try again or report problem to the system administrator"
  );
};
