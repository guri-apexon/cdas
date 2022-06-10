const DB = require("../config/db");
const { getCurrentTime, validateEmail } = require("../helpers/customFunctions");
const Logger = require("../config/logger");
const axios = require("axios");
const userHelper = require("../helpers/userHelper");
const tenantHelper = require("../helpers/tenantHelper");
const apiResponse = require("../helpers/apiResponse");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

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
      `SELECT *, CASE WHEN TRIM(usr_stat) IN ('In Active', 'Inactive', 'In active', 'inactive', 'InActive', 'in active') THEN 'Inactive' ELSE TRIM(usr_stat) END AS formatted_stat, TRIM(usr_stat) AS trimed_usr_stat,  CONCAT(usr_fst_nm,' ',usr_lst_nm) AS usr_full_nm from ${schemaName}.user`
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
}

exports.createNewUser = async (req, res) => {
  const data = req.body;
  Logger.info({ message: "create user - begin" });

  // validate data
  const validate = await userHelper.validateCreateUserData(data);
  if (validate.success === false)
    return apiResponse.ErrorResponse(res, validate.message);

  // validate tenant
  const tenant_id = await tenantHelper.isTenantExists(data.tenant);
  if (!tenant_id)
    return apiResponse.ErrorResponse(res, "Tenant does not exists");

  // provision into SDA and save
  const user = await userHelper.isUserExists(data.email);
  let usr_id = (user && user.usr_id) || "";
  let usr_stat = (user && user.usr_stat) || "";

  if (usr_stat == "ACTIVE" || usr_stat == "INVITED")
    return apiResponse.ErrorResponse(
      res,
      "User already exists in the database"
    );

  if (data.userType === "internal") {
    const provision_response = await userHelper.provisionInternalUser(data);
    if (provision_response) {
      if (usr_stat == "INACTIVE")
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
      if (usr_stat == "INACTIVE")
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
