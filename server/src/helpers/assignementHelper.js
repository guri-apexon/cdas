const DB = require("../config/db");
const { validateEmail } = require("./customFunctions");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

/**
 * Validates data for multiple user protocol assignment
 * @param {object} data
 * @returns object with property success as true on success false otherwise, also returns
 * a message as per the validation
 */
exports.validateAssignment = async (data) => {
  const { tenant, email, uid, protocols } = data;
  // protocol: { number: '', roles: ['', ''] }

  if (!data) {
    return { success: false, message: "data not provided" };
  }

  if (!(tenant && tenant.trim()))
    return { success: false, message: "Tenant is required field" };

  if (!(email && email.trim() && validateEmail(email)))
    return { success: false, message: "Email id blank or invalid" };

  if (!(protocols && Array.isArray(protocols) && protocols.length > 0))
    return { success: false, message: "Protocol required" };

  if (!protocols.every((p) => p.roles && p.roles.length > 0))
    return { success: false, message: "Each Protocol must have one role" };

  return { success: true, message: "validation success" };
};

/**
 * Checks whether a user, study, role combination exists or not
 * @param {string} usr_id User Id
 * @param {string} prot_id Protocol Id
 * @param {number} role_id Role Id
 * @returns Returns the row otherwise false
 */
exports.isUserStudyRoleExists = async (usr_id, prot_id, role_id) => {
  const query = `SELECT * FROM ${schemaName}.study_user_role WHERE usr_id='${usr_id}' AND prot_id='${prot_id}' AND role_id='${role_id}' LIMIT 1`;
  try {
    const result = DB.executeQuery(query);
    if (result.rowCount > 0) return result.rows[0];
  } catch (error) {
    console.log(">>>> error:isUserStudyRoleExists ", error);
  }
  return false;
};

/**
 * Inserts a new record in study_user and study_user_role tables only if not present
 * @param {string} usr_id User Id
 * @param {string} prot_id Protocol Id
 * @param {number} role_id Role id
 * @param {string} createdBy user id of the person doing the operation
 * @param {string} createdOn date and time of the operation
 * @returns id of newly created study user role otherwise false
 */
exports.insertUserStudyRole = async (
  usr_id,
  prot_id,
  role_id,
  createdBy,
  createdOn
) => {
  const checkStudyUserQuery = `
    SELECT * FROM ${schemaName}.study_user
    WHERE usr_id='${usr_id}' AND prot_id='${prot_id}'  
    LIMIT 1`;

  const checkStudyUserRoleQuery = `
    SELECT * FROM ${schemaName}.study_user_role 
    WHERE usr_id='${usr_id}' AND prot_id='${prot_id}' AND role_id='${role_id}' 
    LIMIT 1`;

  const insertStudyUserQuery = `
    INSERT INTO ${schemaName}.study_user (prot_id, usr_id, act_flg,insrt_tm, updt_tm)  
    VALUES($1,$2,$3,$4,$5)`;

  const insertStudyUserRole = `
    INSERT INTO ${schemaName}.study_user_role ( role_id, prot_id, usr_id, act_flg, created_by, created_on, updated_by, updated_on)   
    VALUES($1, $2, $3, $4, $5, $6, NULL, NULL) RETURNING prot_usr_role_id`;

  let result1, result2;
  try {
    const q1 = await DB.executeQuery(checkStudyUserQuery);
    if (!(q1 && q1.rowCount > 0)) {
      result1 = await DB.executeQuery(insertStudyUserQuery, [
        prot_id,
        usr_id,
        1,
        createdOn,
        createdOn,
      ]);
    }

    const q2 = await DB.executeQuery(checkStudyUserRoleQuery);
    if (!(q2 && q2.rowCount > 0)) {
      result2 = await DB.executeQuery(insertStudyUserRole, [
        role_id,
        prot_id,
        usr_id,
        1,
        createdBy,
        createdOn,
      ]);
    }
    return true;
  } catch (error) {
    console.log(">>>> error:insertUserStudyRole ", error);
  }
  return false;
};
