const { default: axios } = require("axios");
const { result } = require("lodash");
const ActiveDirectory = require("activedirectory2").promiseWrapper;
const DB = require("../config/db");
const { data } = require("../config/logger");
const { getCurrentTime, validateEmail } = require("./customFunctions");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const {
  DB_SCHEMA_NAME: schemaName,
  AD_CONFIG: ADConfig,
  FSR_API_URI,
  FSR_HEADERS,
} = require("../config/constants");
const e = require("express");

const SDA_BASE_API_URL = `${process.env.SDA_BASE_URL}/sda-rest-api/api/external/entitlement/V1/ApplicationUsers`;
const SDA_Endpoint = `${SDA_BASE_API_URL}?appKey=${process.env.SDA_APP_KEY}`;
const SDA_Endpoint_Deprovision = `${SDA_BASE_API_URL}/deprovisionUserFromApplication`;
const SDA_Endpoint_get_users = `${SDA_BASE_API_URL}/getUsersForApplication?appKey=${process.env.SDA_APP_KEY}`;

exports.CONSTANTS = {
  INACTIVE: "INACTIVE",
  ACTIVE: "ACTIVE",
  INVITED: "INVITED",
  EXTERNAL: "EXTERNAL",
  INTERNAL: "INTERNAL",
};

/**
 *
 * @param {*appKey, userType, roleType, email, updatedBy  , networkId} data
 * @param {*} user_type
 * @returns
 */

exports.deProvisionUser = async (data, user_type) => {
  let requestBody;
  try {
    if (user_type === "internal") {
      const { email, ...rest } = data;
      requestBody = rest;
    } else {
      const { networkId, ...rest } = data;
      requestBody = rest;
    }
    return await axios.delete(SDA_Endpoint_Deprovision, { data: requestBody });
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

const compareString = (val1, val2) => {
  if (val1 && val2) {
    val1 = val1.toUpperCase().trim().replace(" ", "");
    val2 = val2.toUpperCase().trim().replace(" ", "");
    return val1 === val2;
  }
};
exports.findUser = async (filter) => {
  const query = `SELECT *, UPPER(usr_stat) as userState, UPPER(usr_typ) as userType  FROM ${schemaName}.user WHERE ${filter};`;
  try {
    const response = await DB.executeQuery(query);
    if (response.rowCount > 0) {
      const row = response.rows[0];
      console.log("user", {
        ...row,
        isActive: compareString(row.userstate, this.CONSTANTS.ACTIVE),
        isInvited: compareString(row.userstate, this.CONSTANTS.INVITED),
        isInactive: compareString(row.userstate, this.CONSTANTS.INACTIVE),
        isExternal: compareString(row.usertype, this.CONSTANTS.EXTERNAL),
        isInternal: compareString(row.usertype, this.CONSTANTS.INTERNAL),
      });
      return {
        ...row,
        isActive: compareString(row.userstate, this.CONSTANTS.ACTIVE),
        isInvited: compareString(row.userstate, this.CONSTANTS.INVITED),
        isInactive: compareString(row.userstate, this.CONSTANTS.INACTIVE),
        isExternal: compareString(row.usertype, this.CONSTANTS.EXTERNAL),
        isInternal: compareString(row.usertype, this.CONSTANTS.INTERNAL),
      };
    }
  } catch (error) {
    Logger.error("userHelper.findUser", error);
  }
  return undefined;
};

/**
 * Checks that if a user exists or not
 * @param {string} userId
 * @returns on success user usr_id and usr_stat (in upper case) , on error reurns false
 */
exports.findByUserId = async (userId) =>
  await this.findUser(`usr_id = '${userId}';`);

/**
 * Checks that if a user exists or not
 * @param {string} email
 * @returns on success user usr_id and usr_stat (in upper case) , on error reurns false
 */
exports.findByEmail = async (email) =>
  await this.findUser(`UPPER(usr_mail_id) = '${email.toUpperCase()}';`);

/**
 * Checks that if a user exists or not
 * @param {string} email
 * @returns on success user usr_id and usr_stat (in upper case) , on error reurns false
 */
exports.isUserExists = async (email) => this.findByEmail(email);

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
 * @returns {Promise<object>} success as true on success false other wise
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
      userKey: sda_usr_key = "",
    } = userDetails;

    const internalQuery = `INSERT INTO ${schemaName}.user(usr_id, usr_typ, usr_fst_nm, usr_lst_nm, usr_mail_id, insrt_tm, updt_tm, usr_stat, extrnl_emp_id) VALUES(
      '${usr_id}', '${usr_typ}', '${usr_fst_nm}', '${usr_lst_nm}', '${usr_mail_id}', '${insrt_tm}', '${updt_tm}', '${usr_stat}', '${extrnl_emp_id}') RETURNING usr_id`;

    const externalQuery = `INSERT INTO ${schemaName}.user( usr_typ, usr_fst_nm, usr_lst_nm, usr_mail_id, insrt_tm, updt_tm, usr_stat, extrnl_emp_id, sda_usr_key) VALUES(
      '${usr_typ}', '${usr_fst_nm}', '${usr_lst_nm}', '${usr_mail_id}', '${insrt_tm}', '${updt_tm}', '${usr_stat}', '${extrnl_emp_id}', '${sda_usr_key}') RETURNING usr_id`;

    const query = usr_typ === "internal" ? internalQuery : externalQuery;
    const response = await DB.executeQuery(query);
    return response.rows[0].usr_id;
  } catch (err) {
    console.log("error: insertUserInDb", err);
    return false;
  }
};

exports.getUsersFromAD = async (query = "") => {
  const ad = new ActiveDirectory(ADConfig);
  const mustMailFilter = `(mail=*)`;
  const userFilter = `(objectCategory=person)(objectClass=user)${mustMailFilter}`;
  const emailFilter = `(mail=*${query}*)`;
  const firstNameFilter = `(givenName=*${query}*)`;
  const lastNameFilter = `(sn=*${query}*)`;
  const displayNameFilter = `(displayName=*${query}*)`;
  const filter = query
    ? `(&${userFilter}(|${emailFilter}${firstNameFilter}${lastNameFilter}${displayNameFilter}))`
    : `(&${userFilter})`;

  const opts = {
    filter,
    sizeLimit: 100,
    attributes: [
      "givenName",
      "sn",
      "displayName",
      "mail",
      "userPrincipalName",
      "employeeID",
      "sAMAccountName",
    ],
  };

  try {
    const res = await ad.findUsers(opts);
    return res;
  } catch (err) {
    console.log("error: getUsersFromAD", err);
    return false;
  }
};
exports.getSDAuserDataById = async (uid) => {
  try {
    const response = await axios.get(SDA_Endpoint_get_users);
    return response?.data.find((e) => e?.userId == uid);
  } catch (error) {
    console.log("Internal user provision error", data, error);
  }
};

exports.revokeStudy = async (requestBody, studyList) => {
  const FSR_Revoke = `${FSR_API_URI}/study/revoke`;
  let apiStatus = "";
  for (const element of studyList) {
    axios
      .post(
        FSR_Revoke,
        { ...requestBody, studyId: element?.prot_nbr_stnd },
        {
          headers: FSR_HEADERS,
        }
      )
      .then((res) => {})
      .catch((err) => {
        apiStatus = false;
      });
  }

  return apiStatus === "" ? true : false;
};
