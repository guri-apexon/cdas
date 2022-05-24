const DB = require("../config/db");
const constants = require("../config/constants");
const { getCurrentTime, validateEmail } = require("../helpers/customFunctions");
const Logger = require("../config/logger");
const axios = require("axios");
const userHelper = require("../helpers/userHelper");
const tenantHelper = require("../helpers/tenantHelper");
const apiResponse = require("../helpers/apiResponse");
const schemaName = process.env.SCHEMA;
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

exports.createNewUser = (req, res) => {
  const data = req.body;
  Logger.info({ message: "create user - begin" });

  // validate data
  const validate = userHelper.validateCreateUserData(data);
  if (validate.success === false)
    return apiResponse.ErrorResponse(res, validate.message);

  // validate tenant
  const tenant_id = tenantHelper.isTenantExists(data.tenant);
  if (!tenant_id)
    return apiResponse.ErrorResponse(res, "Tenant not present in the records");

  // provision into SDA and save
  if (data.userType === "internal") {
    const provision_response = userHelper.provisionInternalUser(data);
    if (provision_response) {
      const db_uid = this.isUserExists(uid, email, "");
      db_uid
        ? userHelper.makeUserActive(uid)
        : this.insertUserInDb({
            ...data,
            status: "Active",
            externalId: data.uid,
          });
    }
  } else {
    const provision_response = userHelper.provisionExternalUser(data);
    if (provision_response) {
      const db_uid = this.isUserExists(uid, email, "");
      db_uid
        ? userHelper.makeUserActive(uid)
        : this.insertUserInDb({
            ...data,
            status: "invited",
            uid: "",
            externalId: response.data,
          });
    }
  }

  // save tenant user relationship
  tenantHelper.insertTenantUser(db_uid, tenant_id);

  return apiResponse.successResponseWithData(res, "User successfully created");
};
