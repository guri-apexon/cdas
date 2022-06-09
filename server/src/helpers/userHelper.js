const { default: axios } = require("axios");
const { result } = require("lodash");
const DB = require("../config/db");
const { data } = require("../config/logger");
const { getCurrentTime, validateEmail } = require("./customFunctions");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

const SDA_BASE_API_URL = `${process.env.SDA_BASE_URL}/sda-rest-api/api/external/entitlement/V1/ApplicationUsers`;
const SDA_Endpoint = `${SDA_BASE_API_URL}?appKey=${process.env.SDA_APP_KEY}`;
const SDA_Endpoint_Deprovision = `${SDA_BASE_API_URL}/deprovisionUserFromApplication`;
const SDA_Endpoint_get_users = `${SDA_BASE_API_URL}/getUsersForApplication?appKey=${process.env.SDA_APP_KEY}`;

exports.deProvisionUser = async (data) => {
  const { appKey, userType, roleType, email, updatedBy } = data;
  try {
    const response = await axios(SDA_Endpoint_Deprovision);
    return response;
  } catch (error) {
    return error;
  }
};

/**
 * Verifies the email with SDA whether it is provisioned or not
 * @param {*} email
 * @returns true on success, false otherwise
 */
exports.isUserAlreadyProvisioned = async (email) => {
  try {
    const response = await axios.get(SDA_Endpoint_get_users);
    const user =
      response.data &&
      response.data.find(
        (row) => row.email.toUpperCase() === email.toUpperCase()
      );
    if (user) return true;
    return false;
  } catch (error) {
    console.log("error: isUserAlreadyProvisioned", email, error);
    return false;
  }
};

/**
 * Provisions internal user with the SDA
 * @param {object} uid, updatedBy
 * @returns uid on success false otherwise
 */
exports.provisionInternalUser = async (data) => {
  const { uid: networkId, updatedBy } = data;
  const userType = "internal";
  const roleType = "Reader";
  const url = `${SDA_Endpoint}&roleType=${roleType}&userType=${userType}&networkId=${networkId}&updatedBy=${updatedBy}`;

  try {
    const response = await axios.post(url);
    return response.status === 200 ? networkId : false;
  } catch (error) {
    console.log("Internal user provision error", data, error);
    return false;
  }
};

/**
 * Provisions external user with the SDA
 * @param {object} data = { firstName, lastName, email, status, updatedBy }
 * @returns uid on success false otherwise
 */
exports.provisionExternalUser = async (data) => {
  const { firstName, lastName, email, status, updatedBy } = data;
  const userType = "external";

  const url = `${SDA_Endpoint}&userType=${userType}`;

  const body = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    status: "Active",
    assuranceLevel: "High",
    updatedBy: updatedBy,
  };

  var config = {
    method: "post",
    url: url,
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
    },
    data: body,
  };

  try {
    const response = await axios.post(url, body);
    return response;
  } catch (error) {
    console.log("error: provisionExternalUser", body, error);
    return null;
  }
};

/**
 * Checks that if a user exists or not
 * @param {string} email
 * @returns on success user usr_id and usr_stat (in upper case) , on error reurns false
 */
exports.isUserExists = async (email) => {
  const query = `SELECT usr_id, UPPER(usr_stat) as usr_stat, usr_typ FROM ${schemaName}.user WHERE UPPER(usr_mail_id) = '${email.toUpperCase()}';`;

  try {
    var response = await DB.executeQuery(query);
    if (response.rowCount > 0) return response.rows[0];
    return false;
  } catch (error) {
    console.log("error: provisionExternalUser", email, error);
    return false;
  }
};

/**
 * validates data for add user api
 * @param {object} data = {  firstName, lastName, email, uid, employeeId }
 * @returns {success: boolean , message: string} success as true on success false other wise
 */
exports.validateAddUserData = async (data) => {
  const { firstName, lastName, email, uid, employeeId } = data;
  if (!data) {
    return { success: false, message: "data not provided" };
  }
  if (!(firstName && firstName.trim()))
    return { success: false, message: "First Name is required field" };

  if (!(lastName && lastName.trim()))
    return { success: false, message: "Last Name is required field" };

  if (!(email && email.trim()))
    return { success: false, message: "Email id is required field" };

  if (!validateEmail(email))
    return { success: false, message: "Email id invalid" };

  try {
    const isUserAlreadyProvisioned = await this.isUserAlreadyProvisioned(email);
    if (isUserAlreadyProvisioned) {
      return { success: false, message: "User already Provisioned" };
    }
  } catch (error) {}

  return { success: true, message: "validation success" };
};
/**
 * validates data for create user api
 * @param {object} data = { tenant, userType, firstName, lastName, email, uid, employeeId }
 * @returns {success: boolean , message: string} success as true on success false other wise
 */
exports.validateCreateUserData = async (data) => {
  const { tenant, userType, firstName, lastName, email, uid, employeeId } =
    data;

  if (!data) {
    return { success: false, message: "data not provided" };
  }

  if (!(tenant && tenant.trim()))
    return { success: false, message: "Tenant is required field" };

  if (!(userType && userType.trim()))
    return { success: false, message: "Usertype is required field" };

  if (!(userType === "internal" || userType === "external"))
    return { success: false, message: "invalid user type" };

  if (!(firstName && firstName.trim()))
    return { success: false, message: "First Name is required field" };

  if (!(lastName && lastName.trim()))
    return { success: false, message: "Last Name is required field" };

  if (!(email && email.trim()))
    return { success: false, message: "Email id is required field" };

  if (!validateEmail(email))
    return { success: false, message: "Email id invalid" };

  try {
    const isUserAlreadyProvisioned = await this.isUserAlreadyProvisioned(email);
    if (isUserAlreadyProvisioned) {
      return { success: false, message: "User already Provisioned" };
    }
  } catch (error) {}

  return { success: true, message: "validation success" };
};

exports.makeUserActive = async (uid, externalId) => {
  const query = `UPDATE ${schemaName}.user SET usr_stat='Active', extrnl_emp_id='${externalId}' WHERE usr_id = '${uid}'`;
  try {
    const result = await DB.executeQuery(query);
    if (result.rowCount > 0) return uid;
    return false;
  } catch (error) {
    console.log("error: makeUserActive", error);
    return false;
  }
};

exports.insertUserInDb = async (userDetails) => {
  try {
    const {
      uid: usr_id,
      firstName: usr_fst_nm,
      lastName: usr_lst_nm,
      email: usr_mail_id,
      status: usr_stat,
      externalId: extrnl_emp_id,
      invt_sent_tm,
      insrt_tm,
      updt_tm,
      userType: usr_typ,
    } = userDetails;

    const internalQuery = `INSERT INTO ${schemaName}.user(usr_id, usr_typ, usr_fst_nm, usr_lst_nm, usr_mail_id, insrt_tm, updt_tm, usr_stat, extrnl_emp_id) VALUES(
      '${usr_id}', '${usr_typ}', '${usr_fst_nm}', '${usr_lst_nm}', '${usr_mail_id}', '${insrt_tm}', '${updt_tm}', '${usr_stat}', '${extrnl_emp_id}') RETURNING usr_id`;

    const externalQuery = `INSERT INTO ${schemaName}.user( usr_typ, usr_fst_nm, usr_lst_nm, usr_mail_id, insrt_tm, updt_tm, usr_stat, extrnl_emp_id) VALUES(
      '${usr_typ}', '${usr_fst_nm}', '${usr_lst_nm}', '${usr_mail_id}', '${insrt_tm}', '${updt_tm}', '${usr_stat}', '${extrnl_emp_id}') RETURNING usr_id`;

    const query = usr_typ === "internal" ? internalQuery : externalQuery;
    const response = await DB.executeQuery(query);
    return response.rows[0].usr_id;
  } catch (err) {
    console.log("error: insertUserInDb", err);
    return false;
  }
};
