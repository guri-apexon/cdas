const DB = require("../config/db");
const { getCurrentTime, validateEmail } = require("../helpers/customFunctions");
const Logger = require("../config/logger");
const axios = require("axios");
const userHelper = require("../helpers/userHelper");
const tenantHelper = require("../helpers/tenantHelper");
const apiResponse = require("../helpers/apiResponse");
const constants = require("../config/constants");
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
      `SELECT *, CASE WHEN LOWER(TRIM(usr_stat)) IN ('in active', 'inactive') THEN 'Inactive' WHEN LOWER(TRIM(usr_stat)) IN ('active') THEN 'Active' WHEN LOWER(TRIM(usr_stat)) IN ('invited') THEN 'Invited' WHEN usr_stat IS NULL THEN 'Active' ELSE TRIM(usr_stat) END AS formatted_stat, TRIM(usr_stat) AS trimed_usr_stat,  CONCAT(usr_fst_nm,' ',usr_lst_nm) AS usr_full_nm from ${schemaName}.user`
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

async function createNewUser(data, req, res) {
  // validate data
  const validate = await userHelper.validateCreateUserData(data);
  if (validate.success === false)
    return apiResponse.ErrorResponse(res, validate.message);

  // validate tenant
  const tenant_id = await tenantHelper.findByName(data.tenant);
  if (!tenant_id)
    return apiResponse.ErrorResponse(res, "Tenant does not exists");

  // provision into SDA and save
  const user = await userHelper.findByEmail(data.email);
  let usr_id = (user && user.usr_id) || "";
  let usr_stat = (user && user.usr_stat) || "";

  if (user.isActive || user.isInvited)
    return apiResponse.ErrorResponse(
      res,
      "User already exists in the database"
    );

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
      return apiResponse.ErrorResponse(
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
          externalId: provision_response.data,
        });
    } else {
      return apiResponse.ErrorResponse(
        res,
        "An error occured while provisioning external user"
      );
    }
  }
  if (!usr_id)
    apiResponse.ErrorResponse(res, "An error occured while inserting the user");

  if (usr_id && tenant_id) tenantHelper.insertTenantUser(usr_id, tenant_id);
  else
    apiResponse.ErrorResponse(
      res,
      "An error occured while entering user and tenant detail"
    );
  return apiResponse.successResponseWithData(res, "User successfully created");
}

exports.inviteExternalUser = async (req, res) => {
  // { , , firstName, lastName, email, uid, employeeId }

  // firstName,
  // lastName,
  // email,
  // uid: employeeId,
  // updatedBy:currentUser,
  const data = req.body;
  data["userType"] = data.userType;
  data["updatedBy"] = data.uid;
  Logger.info({ message: "add user - begin" });

  // Fetch First Tenet
  const query = `SELECT tenant_nm FROM ${schemaName}.tenant LIMIT 1`;
  try {
    const result = await DB.executeQuery(query);
    if (result.rowCount > 0) {
      data["tenant"] = result.rows[0].tenant_nm;
    } else {
      return apiResponse.ErrorResponse(res, "Tenant does not exists");
    }
  } catch (error) {
    return apiResponse.ErrorResponse(res, "Unable to fetch tenet");
  }

  const response = await createNewUser(data, req, res);
  return response;
};

exports.createNewUser = async (req, res) => {
  const data = req.body;
  Logger.info({ message: "create user - begin" });
  const response = await createNewUser(data, req, res);
  return response;
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

