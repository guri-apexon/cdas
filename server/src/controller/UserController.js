const DB = require("../config/db");
const { getCurrentTime, validateEmail } = require("../helpers/customFunctions");
const Logger = require("../config/logger");
const axios = require("axios");
const userHelper = require("../helpers/userHelper");
const tenantHelper = require("../helpers/tenantHelper");
const apiResponse = require("../helpers/apiResponse");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName, SDA_APP_KEY, SDA_BASE_URL } = constants;

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

exports.createNewUser = async (req, res) => {
  const data = req.body;

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

        const user = await userHelper.findByEmail(email_id);

        // SDA
        if (user?.isActive) {
          const userDetails = await userHelper.getSDAuserDataById(user_id);

          const requestBody = {
            appKey: SDA_APP_KEY,
            userType: user_type,
            roleType: userDetails?.roleType,
            networkId: user_id,
            updatedBy: "Admin",
          };

          let sda_status = {};
          sda_status = await userHelper.deProvisionUser(requestBody, user_type);

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

