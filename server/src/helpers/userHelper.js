const { default: axios } = require("axios");
const { result } = require("lodash");
const DB = require("../config/db");
const { data } = require("../config/logger");
const { getCurrentTime, validateEmail } = require("./customFunctions");
const Logger = require("../config/logger");

const SDA_BASE_API_URL = `${process.env.SDA_BASE_URL}/sda-rest-api/api/external/entitlement/V1/ApplicationUsers`;
const SDA_Endpoint = `${SDA_BASE_API_URL}?appKey=${process.env.SDA_APP_KEY}`;
const SDA_Endpoint_Deprovision = `${SDA_BASE_API_URL}/deprovisionUserFromApplication`;
const SDA_Endpoint_get_users = `${SDA_BASE_API_URL}/getUsersForApplication?appKey=${process.env.SDA_APP_KEY}`;

const schemaName = process.env.SCHEMA;

exports.deProvisionUser = async (data) => {
  const { appKey, userType, roleType, email, updatedBy } = data;
  try {
    const response = await axios(SDA_Endpoint_Deprovision);
    return response;
  } catch (error) {
    return error;
  }
};

exports.isUserAlreadyProvisioned = async (email) => {
  try {
    const response = await axios.get(SDA_Endpoint_get_users);
    if (
      data &&
      data.find((row) => row.email.toUpperCase() === email.toUpperCase())
    )
      return true;
    return false;
  } catch (error) {
    return false;
  }
};

exports.provisionInternalUser = async (data) => {
  const { uid: networkId, updatedBy } = data;
  const userType = "internal";
  const roleType = "Admin";
  const url = `${SDA_Endpoint}&roleType=${roleType}&userType=${userType}&networkId=${networkId}&updatedBy=${updatedBy}`;

  try {
    const response = await axios.post(url);
    return response;
  } catch {
    return null;
  }
};

exports.provisionExternalUser = async (data) => {
  const { firstName, lastName, email, status, assuranceLevel, updatedBy } =
    data;

  const userType = "external";

  const url = `${SDA_Endpoint}&roleType=${roleType}&userType=${userType}`;

  const body = JSON.stringify({
    firstName: firstName,
    lastName: lastName,
    email: email,
    status: status,
    assuranceLevel: assuranceLevel,
    updatedBy: updatedBy,
  });

  var config = {
    method: "post",
    url: url,
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
  };

  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    return null;
  }
};

exports.isUserExists = async (uid, email, status) => {
  const filter = [];
  if (uid && uid.trim()) filter.push(`usr_id = '${uid}'`);
  if (email && email.trim()) filter.push(`usr_mail_id = '${email}'`);
  if (status && status.trim()) filter.push(`status = '${status}'`);
  if (filter.length === 0) return null;

  const query = `SELECT usr_id FROM ${schemaName}.user WHERE ${filter.join(
    " AND "
  )};`;

  try {
    var response = await DB.executeQuery(query);
    if (response.rowCount > 0) return response.rows[0].usr_id;
    return null;
  } catch (error) {
    return null;
  }
};

exports.validateCreateUserData = (data) => {
  const { tenant, userType, firstName, lastName, email, uid, employeeId } =
    data;

  if (!data) {
    return { success: false, message: "data not provided" };
  }

  if (!(tenant && tenant.trim()))
    return { success: false, message: "Tenant is required field" };

  if (
    !(
      userType &&
      userType.trim() &&
      (userType === "internal" || userType === "external")
    )
  )
    return { success: false, message: "invalid user type" };

  if (!(firstName && firstName.trim()))
    return { success: false, message: "First Name is required field" };

  if (!(lastName && lastName.trim()))
    return { success: false, message: "Last Name is required field" };

  if (!(email && email.trim() && validateEmail(email)))
    return { success: false, message: "Email id blank or invalid" };

  // if (!(protocols && Array.isArray(protocols) && protocols.length > 0))
  //   return { success: false, message: "Protocol required" };

  // if (!protocols.every((p) => p.roles && p.roles.length > 0))
  //   return { success: false, message: "Each Protocol must have one role" };

  if (this.isUserAlreadyProvisioned(email))
    return { success: false, message: "User already Provisioned" };

  return { success: true, message: "validation success" };
};

exports.makeUserActive = async (uid) => {
  const query = `UPDATE ${schemaName}.user SET usr_state='active' WHERE usr_id = '${uid}'`;
  try {
    const result = await DB.executeQuery(query);
    if (result.rowCount > 0) return true;
    return false;
  } catch (error) {
    return false;
  }
};

exports.insertUserInDb = (userDetails) => {
  try {
    const {
      uid: usr_id,
      firstName: usr_fst_nm,
      lastName: usr_lst_nm,
      email: usr_mail_id,
      status: usr_stat,
      invt_sent_tm,
      externalId: extrnl_emp_id,
      insrt_tm,
      updt_tm,
    } = userDetails;

    const query = `INSERT INTO ${schemaName}.user(usr_id, usr_fst_nm, usr_lst_nm, usr_mail_id, insrt_tm, updt_tm, usr_stat, extrnl_emp_id) VALUES(
      '${usr_id}', '${usr_fst_nm}', '${usr_lst_nm}', '${usr_mail_id}', '${insrt_tm}', '${updt_tm}', '${usr_stat}', '${extrnl_emp_id}') RETURNING usr_id`;

    return DB.executeQuery(query).then((response) => {
      return response.rowCount;
    });
  } catch (err) {
    //throw error in json response with status 500.
    return err;
  }
};
