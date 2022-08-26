const { default: axios } = require("axios");
const { result } = require("lodash");
const ActiveDirectory = require("activedirectory2").promiseWrapper;
const DB = require("../config/db");
const { data } = require("../config/logger");
const {
  getCurrentTime,
  validateEmail,
  checkProtocolRoles,
  checkProtocolRoleIds,
} = require("./customFunctions");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const assert = require("assert");
const ldap = require("ldapjs");
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
const SDA_Endpoint_get_user_status = `${SDA_BASE_API_URL}/UserProvisioningStatus?appKey=${process.env.SDA_APP_KEY}`;

exports.CONSTANTS = {
  INACTIVE: "INACTIVE",
  ACTIVE: "ACTIVE",
  INVITED: "INVITED",
  EXTERNAL: "EXTERNAL",
  INTERNAL: "INTERNAL",
};

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
    // Return true status manually if user already not present in the SDA
    if (error?.response?.data?.code === "ENTITY_NOT_FOUND") {
      return { status: 200 };
    }
    console.log(error.data);
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
exports.provisionInternalUser = async (data, handleDuplicateEntity) => {
  const { uid: networkId, updatedBy } = data;
  const userType = "internal";
  const roleType = "Reader";
  const url = `${SDA_Endpoint}&roleType=${roleType}&userType=${userType}&networkId=${networkId}&updatedBy=${updatedBy}`;

  try {
    const response = await axios.post(url);

    return response.status === 200 ? networkId : false;
  } catch (error) {
    console.log("Internal user provision error", data, error);
    if (
      handleDuplicateEntity &&
      error?.response?.data?.code === "DUPLICATE_ENTITY"
    ) {
      return error?.response?.data?.code;
    }
    return false;
  }
};

/**
 * Provisions external user with the SDA
 * @param {object} data = { firstName, lastName, email, status, updatedBy }
 * @returns uid on success false otherwise
 */
exports.provisionExternalUser = async (data, handleDuplicateEntity) => {
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
    if (
      handleDuplicateEntity &&
      error?.response?.data?.code === "DUPLICATE_ENTITY"
    ) {
      return error?.response?.data?.code;
    }
    return null;
  }
};

/**
 * Compares two strings ignoring case
 * @param {string} val1
 * @param {string} val2
 * @returns
 */
const compareString = (val1, val2) => {
  val1 = val1?.toUpperCase().trim().replace(" ", "");
  val2 = val2?.toUpperCase().trim().replace(" ", "");
  return val1 === val2;
};

exports.findUser = async (filter) => {
  const query = `SELECT * FROM ${schemaName}.user WHERE ${filter};`;
  try {
    const response = await DB.executeQuery(query);
    if (response.rowCount > 0) {
      const row = response.rows[0];
      const isActive = compareString(row.usr_stat, this.CONSTANTS.ACTIVE);
      const isInvited = compareString(row.usr_stat, this.CONSTANTS.INVITED);
      const isInactive = !isActive && !isInvited; // compareString(row.usr_stat, this.CONSTANTS.INACTIVE);
      const isExternal = compareString(row.usr_typ, this.CONSTANTS.EXTERNAL);
      const isInternal = compareString(row.usr_typ, this.CONSTANTS.INTERNAL);

      return {
        ...row,
        isActive,
        isInvited,
        isInactive,
        isExternal,
        isInternal,
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
  await this.findUser(`UPPER(usr_mail_id) = '${email.trim().toUpperCase()}';`);

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
exports.validateCreateUserData = async (data, checkProtocol = false) => {
  const {
    tenant,
    userType,
    firstName,
    lastName,
    email,
    uid,
    employeeId,
    protocols,
  } = data;

  if (!data) {
    return { success: false, message: "data not provided" };
  }

  if (!(tenant && tenant.trim()))
    return { success: false, message: "Tenant is required field" };

  if (!(userType && userType.trim()))
    return { success: false, message: "Usertype is required field" };

  if (!(userType === "internal" || userType === "external"))
    return { success: false, message: "invalid user type" };

  if (userType === "internal" && !uid) {
    return { success: false, message: "Employee ID is required" };
  }

  if (!(firstName && firstName.trim()))
    return { success: false, message: "First Name is required field" };

  if (!(lastName && lastName.trim()))
    return { success: false, message: "Last Name is required field" };

  if (!(email && email.trim()))
    return { success: false, message: "Email id is required field" };

  if (!validateEmail(email))
    return { success: false, message: "Email id invalid" };

  if (checkProtocol) {
    if (!protocols) {
      return { success: false, message: "Select a protocol" };
    }
    
    if (!checkProtocolRoles(protocols))
      return { success: false, message: "Roles is required" };

    if (!checkProtocolRoleIds(protocols))
      return { success: false, message: "Roles is required" };
  }

  try {
    const isUserAlreadyProvisioned = await this.isUserAlreadyProvisioned(email);
    if (isUserAlreadyProvisioned) {
      return { success: false, message: "User already in system" };
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

    const externalQuery = `INSERT INTO ${schemaName}.user( usr_typ, usr_fst_nm, usr_lst_nm, usr_mail_id, insrt_tm, updt_tm, usr_stat, extrnl_emp_id, sda_usr_key, invt_sent_tm) VALUES(
      '${usr_typ}', '${usr_fst_nm}', '${usr_lst_nm}', '${usr_mail_id}', '${insrt_tm}', '${updt_tm}', '${usr_stat}', '${extrnl_emp_id}', '${sda_usr_key}', '${invt_sent_tm}') RETURNING usr_id`;

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
  const filter = `(sAMAccountName=${query})`;
  // const mustMailFilter = `(mail=*)`;
  // const idFilter = `(|(sAMAccountName=u*)(sAMAccountName=q*))`;
  // const userFilter = `(objectCategory=person)(objectClass=user)(!(cn=*Group*))${mustMailFilter}${idFilter}`;
  // const emailFilter = `(mail=*${query}*)`;
  // const firstNameFilter = `(givenName=*${query}*)`;
  // const lastNameFilter = `(sn=*${query}*)`;
  // const displayNameFilter = `(displayName=*${query}*)`;
  // const filter = query
  //   ? `(&${userFilter}(|${emailFilter}${firstNameFilter}${lastNameFilter}${displayNameFilter}))`
  //   : `(&${userFilter})`;

  const opts = {
    paged: true,
    filter,
    sizeLimit: 1000,
    attributes: [
      "givenName",
      "sn",
      "displayName",
      "mail",
      "userPrincipalName",
      "employeeID",
      "sAMAccountName",
      "userAccountControl",
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

exports.getSDAuserDataByEmail = async (email) => {
  try {
    const response = await axios.get(SDA_Endpoint_get_users);
    // console.log(response);
    return response?.data.find((e) => e?.email == email);
  } catch (error) {
    console.log("External user provision error", data, error);
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

exports.getSDAUsers = async () => {
  try {
    const response = await axios.get(SDA_Endpoint_get_users);
    if (response && response.data) return response.data;
    return [];
  } catch (error) {
    console.log("error: getSDAUsers", error);
    return [];
  }
};

exports.getSDAUserStatus = async (userKey, email) => {
  if (!userKey) {
    // console.log("user key not found, cannot fetch sda user:", email);
    return false;
  }
  try {
    const response = await axios.get(
      `${SDA_Endpoint_get_user_status}&userKey=${userKey}`
    );
    if (
      response?.data?.status.trim().toLowerCase() === "provisioning successfull"
    ) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(
      "Internal user fetch status error",
      error?.response?.data || error
    );
    return false;
  }
};

exports.checkPermission = async (userid, feature) => {
  const query = `select count(1) 
      from ${schemaName}."user" u 
      join ${schemaName}.study_user_role sur on u.usr_id = sur.usr_id 
      join ${schemaName}."role" r on sur.role_id =r.role_id  
      left join ${schemaName}.role_policy rp on r.role_id = rp.role_id
      left join ${schemaName}.policy pm on pm.plcy_id = rp.plcy_id
      left join ${schemaName}.policy_product_permission pppm on pppm.plcy_id = pm.plcy_id
      left join ${schemaName}.product_permission pp on pp.prod_permsn_id = pppm.prod_permsn_id
      left join ${schemaName}.product p2 on p2.prod_id = pp.prod_id
      left join ${schemaName}.feature f2 on f2.feat_id = pp.feat_id
      left join ${schemaName}."permission" p3 on p3.permsn_id = pp.permsn_id
      left join ${schemaName}.category c2 on c2.ctgy_id = pp.ctgy_id
      where p3.permsn_nm in ('Create','Update') and 
      f2.feat_nm = '${feature}' and 
      sur.usr_id ='${userid}' and 
      UPPER(u.usr_stat) = 'ACTIVE' 
      `;
  try {
    const result = await DB.executeQuery(query);
    if (result && result.rowCount > 0) return result.rows[0].count !== "0";
  } catch (error) {}
  return false;
};

exports.checkPermissionReadOnly = async (userid, feature) => {
  const query = `select count(1) 
  from ${schemaName}."user" u 
  join ${schemaName}.study_user_role sur on u.usr_id = sur.usr_id 
  join ${schemaName}."role" r on sur.role_id =r.role_id  
  left join ${schemaName}.role_policy rp on r.role_id = rp.role_id
  left join ${schemaName}.policy pm on pm.plcy_id = rp.plcy_id
  left join ${schemaName}.policy_product_permission pppm on pppm.plcy_id = pm.plcy_id
  left join ${schemaName}.product_permission pp on pp.prod_permsn_id = pppm.prod_permsn_id
  left join ${schemaName}.product p2 on p2.prod_id = pp.prod_id
  left join ${schemaName}.feature f2 on f2.feat_id = pp.feat_id
  left join ${schemaName}."permission" p3 on p3.permsn_id = pp.permsn_id
  left join ${schemaName}.category c2 on c2.ctgy_id = pp.ctgy_id
  where p3.permsn_nm in ('Read') and 
  f2.feat_nm = '${feature}' and 
  sur.usr_id ='${userid}' and 
  UPPER(u.usr_stat) = 'ACTIVE' 
`;
  try {
    const result = await DB.executeQuery(query);
    if (result && result.rowCount > 0) return result.rows[0].count !== "0";
  } catch (error) {}
  return false;
};

exports.findUserByEmailAndId = async (userid, email) => {
  const query = `
    SELECT count(1) 
    FROM ${schemaName}.user 
    WHERE usr_id = '${userid}' 
    and UPPER(usr_mail_id)='${email.toUpperCase()}';`;

  try {
    const rows = await DB.executeQuery(query);
    if (rows.rowCount > 0) {
      return true;
    }
  } catch (error) {
    Logger.error("userHelper.findUser", error);
  }
  return undefined;
};

exports.getExternalUserInternalId = async (user_id) => {
  const query = `SELECT * from ${schemaName}.user where upper(usr_id) = upper($1)`;
  const externalUserQuery = `SELECT * from ${schemaName}.user where extrnl_emp_id =$1`;

  try {
    const result = await DB.executeQuery(query, [user_id]);
    if (result?.rowCount > 0) {
      return result?.rows[0]?.usr_id;
    } else {
      try {
        const externalUserResult = await DB.executeQuery(externalUserQuery, [
          user_id,
        ]);
        if (externalUserResult?.rowCount > 0) {
          console.log(externalUserResult?.rows[0]?.usr_id);
          return externalUserResult?.rows[0]?.usr_id;
        }
      } catch (error) {
        return null;
      }
    }
  } catch (error) {
    return null;
  }
};

exports.getUsersFromAD_new = async (query = "") => {
  const client = ldap.createClient({
    url: [ADConfig.url],
  });

  client.on("error", (err) => {
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
    console.log(err);
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
  });

  client.bind(ADConfig.username, ADConfig.password, async (err) => {
    if (err) {
      assert.ifError(err);
    } else {
    }
  });

  const mustMailFilter = `(mail=*)`;
  const idFilter = `(|(sAMAccountName=u*)(sAMAccountName=q*))`;
  const userFilter = `(objectCategory=person)(objectClass=user)(!(cn=*Group*))${mustMailFilter}${idFilter}`;
  const emailFilter = `(mail=*${query}*)`;
  const firstNameFilter = `(givenName=*${query}*)`;
  const lastNameFilter = `(sn=*${query}*)`;
  const displayNameFilter = `(displayName=*${query}*)`;
  const filter = query
    ? `(&${userFilter}(|${emailFilter}${firstNameFilter}${lastNameFilter}${displayNameFilter}))`
    : `(&${userFilter})`;
  // const customFilter = `(&${userFilter}(|(givenName=*${query})(givenName=${query}*)))`;
  const sizeLimit = 5000;

  const opts = {
    filter,
    scope: "sub",
    timeLimit: 200,
    // sizeLimit,
    paged: {
      pageSize: sizeLimit,
      pagePause: true,
    },
    // pageLimit: -1,
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

  // console.log("*********************************************************");

  const res = await new Promise((resolve, reject) => {
    client.search(ADConfig.baseDN, opts, [], function name(e, res) {
      // console.log("----------------------------------------");
      let messageID = null;
      const data = [];
      if (e) {
        // console.log("Error occurred while ldap search");
      } else {
        res.on("searchEntry", function (entry) {
          // console.log("---------------------------[");
          // console.log(entry);
          // console.log("Entry", JSON.stringify(entry.object));
          // client.abandon(messageID);
          // console.log("entry.object", entry.object.displayName);
          data.push(entry.object);
          // resolve(data);
          if (data.length == sizeLimit) {
            // client.abandon;
            resolve(data);
          }
        });
        res.on("page", (result, cb) => {
          // Allow the queue to flush before fetching next page
          // console.log("page", result);
          console.log("Page");
          resolve(data);
        });
        // res.on("searchReference", function (referral) {
        //   // console.log("Referral", referral);
        // });
        // res.on("searchRequest", function (req) {
        //   // console.log("searchRequest", req);
        //   messageID = req.messageID;
        //   console.log(messageID);
        // });
        res.on("error", function (err) {
          // console.log("Error is", err);
          // reject(err);
        });
        res.on("end", function (result) {
          // console.log("Result is", Object.keys(result));
          resolve(data);
        });
      }
    });
  });
  console.log("Khatam", res.length);
  // console.log(res);

  return res;
};
