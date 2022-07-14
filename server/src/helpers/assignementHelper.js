const DB = require("../config/db");
const { validateEmail, getCurrentTime } = require("./customFunctions");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const studyHelper = require("./studyHelper");
const roleHelper = require("./roleHelper");
const { result } = require("lodash");
const { insertAuditLog } = require("./studyUserRoleHelper");
const { DB_SCHEMA_NAME: schemaName } = constants;

const STUDY_IDS = {
  ALL_STUDY: "<all>",
  NO_STUDY: "<none>",
};

const STUDY_LABELS = {
  ALL_STUDY: "All (all study access)",
  NO_STUDY: "None (no study access)",
};

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

  if (!(email && email.trim()))
    return { success: false, message: "Email id is required field" };

  if (!validateEmail(email))
    return { success: false, message: "Email id invalid" };

  if (!(protocols && Array.isArray(protocols) && protocols.length > 0))
    return { success: false, message: "Protocols is a required field" };

  if (!protocols.every((p) => p.roles && p.roles.length > 0))
    return {
      success: false,
      message: "Each Protocol must have atleast one role",
    };

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
  Logger.info({
    message: "insertUserStudyRole - begin",
  });
  const checkStudyUserQuery = `
    SELECT * FROM ${schemaName}.study_user
    WHERE usr_id='${usr_id}' AND prot_id='${prot_id}'
    LIMIT 1`;

  const checkStudyUserRoleQuery = `
    SELECT * FROM ${schemaName}.study_user_role
    WHERE usr_id='${usr_id}' AND prot_id='${prot_id}' AND role_id='${role_id}' AND study_asgn_typ is null
    LIMIT 1`;

  const insertStudyUserQuery = `
    INSERT INTO ${schemaName}.study_user (prot_id, usr_id, act_flg,insrt_tm, updt_tm)  
    VALUES('${prot_id}','${usr_id}',1,'${createdOn}','${createdOn}')`;

  const updateStudyUserQuery = `
    UPDATE ${schemaName}.study_user 
    SET  act_flg=1, updt_tm='${createdOn}'
    WHERE usr_id='${usr_id}' AND prot_id='${prot_id}' `;

  const insertStudyUserRole = `
    INSERT INTO ${schemaName}.study_user_role ( role_id, prot_id, usr_id, act_flg, created_by, created_on, updated_by, updated_on)   
    VALUES($1, $2, $3, $4, $5, $6, NULL, NULL) RETURNING prot_usr_role_id`;

  let protocolsInserted = 0;
  let studyRolesUserInserted = 0;

  let result1, result2;
  try {
    const q1 = await DB.executeQuery(checkStudyUserQuery);
    result1 = await DB.executeQuery(
      !(q1 && q1.rowCount > 0) ? insertStudyUserQuery : updateStudyUserQuery
    );
    protocolsInserted++;

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
      studyRolesUserInserted++;
    }
    return { success: true, studyRolesUserInserted, protocolsInserted };
  } catch (error) {
    console.log(">>>> error:insertUserStudyRole ", error);
  }
  return { success: false, studyRolesUserInserted, protocolsInserted };
};

exports.insertUserStudyRoleAllNone = async (
  usr_id,
  prot_id,
  role_id,
  createdBy,
  createdOn
) => {
  Logger.info({
    message: `insertUserStudyRoleAllNone - begin`,
  });

  const study_asgn_typ =
    prot_id === STUDY_IDS.ALL_STUDY
      ? STUDY_LABELS.ALL_STUDY
      : STUDY_LABELS.NO_STUDY;

  const checkStudyUserQuery = `
      SELECT * FROM ${schemaName}.study_user
      WHERE usr_id='${usr_id}' AND prot_id is null
      LIMIT 1`;

  const checkStudyUserRoleQuery = `
      SELECT * FROM ${schemaName}.study_user_role
      WHERE usr_id='${usr_id}' AND prot_id is null AND role_id='${role_id}' AND study_asgn_typ='${study_asgn_typ}'
      LIMIT 1`;

  const insertStudyUserQuery = `
    INSERT INTO ${schemaName}.study_user (usr_id, act_flg,insrt_tm, updt_tm)  
    VALUES('${usr_id}',1,'${createdOn}','${createdOn}')`;

  const updateStudyUserQuery = `
    UPDATE ${schemaName}.study_user 
    SET  act_flg=1, updt_tm='${createdOn}'
    WHERE usr_id='${usr_id}' AND prot_id is null`;

  const insertStudyUserRole = `
    INSERT INTO ${schemaName}.study_user_role ( role_id, usr_id, act_flg, created_by, created_on, study_asgn_typ, updated_by, updated_on)   
    VALUES($1, $2, $3, $4, $5, $6, NULL, NULL) RETURNING prot_usr_role_id`;

  let protocolsInserted = 0;
  let studyRolesUserInserted = 0;

  try {
    if (prot_id === STUDY_IDS.ALL_STUDY) {
      const q1 = await DB.executeQuery(checkStudyUserQuery);
      result1 = await DB.executeQuery(
        !(q1 && q1.rowCount > 0) ? insertStudyUserQuery : updateStudyUserQuery
      );
    }

    protocolsInserted++;

    const q2 = await DB.executeQuery(checkStudyUserRoleQuery);
    if (!(q2 && q2.rowCount > 0)) {
      result2 = await DB.executeQuery(insertStudyUserRole, [
        role_id,
        usr_id,
        1,
        createdBy,
        createdOn,
        study_asgn_typ,
      ]);
      studyRolesUserInserted++;
    }

    return { success: true, studyRolesUserInserted, protocolsInserted };
  } catch (error) {
    console.log(">>>> error:insertUserStudyRoleAllNone ", error);
  }
  return { success: false, studyRolesUserInserted, protocolsInserted };
};

exports.assignmentCleanUpFunction = async (userId) => {
  Logger.info({
    message: "assignmentCleanUpFunction - begin",
  });
  try {
    // Handle All Study No Study
    const functionQuery = `select ${schemaName}.fn_study_user_role_all_studies('${userId}')`;
    const functionResult = await DB.executeQuery(functionQuery);
    Logger.info({
      message: "assignmentCleanUpFunction - end",
    });
  } catch (e) {
    Logger.error("assignmentCleanUpFunction  > " + e);
  }
};

exports.inactiveAllUserStudies = async (userId) => {
  Logger.info({
    message: "inactiveAllUserStudies - begin",
  });

  try {
    // Inactivate all User Studies
    const query = `update ${schemaName}.study_user_role set act_flg=0 where usr_id = '${userId}'`;
    const query2 = `update ${schemaName}.study_user set act_flg=0 where usr_id = '${userId}'`;
    const r = await DB.executeQuery(query);
    const r1 = await DB.executeQuery(query2);
    Logger.info({
      message: "inactiveAllUserStudies - end",
    });
  } catch (e) {
    Logger.error("inactiveAllUserStudies  > " + e);
  }
};

/**
 * Inserts a new record in study_user and study_user_role tables only if not present
 * @param {string} usr_id User Id
 * @param {string} prot_id Protocol Id
 * @param {number} role_id Role id
 * @param {string} updatedBy user id of the person doing the operation
 * @param {string} updatedOn date and time of the operation
 * @returns id of newly created study user role otherwise false
 */
exports.makeUserStudyRoleInactive = async (
  usr_id,
  prot_id,
  role_id,
  updatedBy,
  updatedOn
) => {
  const checkStudyUserRoleQuery = `
    SELECT * FROM ${schemaName}.study_user_role 
    WHERE usr_id='${usr_id}' AND prot_id='${prot_id}' AND role_id='${role_id}' 
    LIMIT 1`;

  const updateQuery = `
    UPDATE ${schemaName}.study_user_role SET act_flg = 0, updated_by='${updatedBy}', updated_on='${updatedOn}'
    WHERE usr_id='${usr_id}' AND prot_id='${prot_id}' AND role_id='${role_id}' 
    RETURNING *`;

  try {
    const isExist = await DB.executeQuery(checkStudyUserRoleQuery);
    if (isExist && isExist.rowCount > 0) {
      const result = await DB.executeQuery(updateQuery);
      return result.rows[0];
    }
  } catch (error) {
    console.log(">>>> error:insertUserStudyRole ", error);
  }
  return false;
};
exports.makeUserStudyInactive = async (
  usr_id,
  prot_id,
  createdBy,
  createdOn
) => {
  const checkStudyUserRoleQuery = `
    SELECT * FROM ${schemaName}.study_user
    WHERE usr_id='${usr_id}' AND prot_id='${prot_id}' AND act_flg = 1
    LIMIT 1`;

  const countActiveRolesQuery = `
    SELECT * FROM ${schemaName}.study_user_role
    WHERE usr_id='${usr_id}' AND prot_id='${prot_id}' AND act_flg = 1`;

  const updateQuery = `
    UPDATE ${schemaName}.study_user SET act_flg = 0, updt_tm = '${createdOn}' 
    WHERE usr_id='${usr_id}' AND prot_id='${prot_id}' 
    RETURNING *`;

  try {
    const isExist = await DB.executeQuery(checkStudyUserRoleQuery);
    if (isExist && isExist.rowCount > 0) {
      const activeRoles = await DB.executeQuery(countActiveRolesQuery);
      if (activeRoles.rowCount == 0) {
        const result = await DB.executeQuery(updateQuery);
        return result.rows[0];
      }
    }
  } catch (error) {
    console.log(">>>> error:insertUserStudy ", error);
  }
  return false;
};

const makeArrayErrorMesage = (prefix, suffix, arr) =>
  (arr.length > 0 &&
    `${prefix} [${arr.map((a) => `'${a}'`).join(", ")}] ${suffix}`) ||
  "";

exports.validateProtocolsRoles = async (user, protocols) => {
  let roleNotPresent = [];
  let roleNotActive = [];
  let protocolNotPresent = [];

  //  await protocols.forEach(async (protocol) => {
  for (let i = 0; i < protocols.length; i++) {
    let protocol = protocols[i];
    const study = await studyHelper.findByProtocolName(protocol.protocolname);
    protocol.isValid = false;
    if (!study) {
      protocolNotPresent.push(protocol.protocolname);
    } else {
      protocol.id = study.prot_id;
      protocol.roleIds = [];
      for (let j = 0; j < protocol.roles.length; j++) {
        const role_name = protocol.roles[j];
        const role = await roleHelper.findByName(role_name);
        if (!role) {
          roleNotPresent.push(role_name);
        } else if (role.role_stat != 1) {
          roleNotActive.push(role_name);
        } else {
          protocol.roleIds.push(role.role_id);
          protocol.isValid = true;
        }
      }
    }
  }
  // create an error message
  let message =
    makeArrayErrorMesage("Protocol(s)", "not found. ", protocolNotPresent) +
    makeArrayErrorMesage("Role(s)", "not found. ", roleNotPresent) +
    makeArrayErrorMesage("Role(s)", "found inactive. ", roleNotActive);

  if (message.trim() !== "")
    return { success: false, message, protocols: null };

  return { success: true, message: "", protocols };
};

exports.protocolsStudyGrant = async (protocols, user, createdBy, createdOn) => {
  for (let i = 0; i < protocols.length; i++) {
    const protocol = protocols[i];
    if (!protocol.isValid) continue;
    try {
      const result = await studyHelper.studyGrant(
        protocol.protocolname,
        user.usr_id,
        createdBy,
        createdOn
      );
      if (!result) {
        Logger.error("assignmentCreate > studyGrant > " + protocol.name);
        return false;
      }
    } catch (error) {
      Logger.error("assignmentCreate > studyGrant > " + protocol.name);
      return false;
    }
  }
  return true;
};

exports.protocolsStudyRevoke = async (
  protocols,
  user,
  createdBy,
  createdOn
) => {
  for (let i = 0; i < protocols.length; i++) {
    const protocol = protocols[i];
    if (!protocol.isValid) continue;
    try {
      const result = await studyHelper.studyRevoke(
        protocol.protocolname,
        user.usr_id,
        createdBy,
        createdOn
      );
      if (!result) {
        Logger.error("assignmentCreate > studyRevoke > " + protocol.name);
        return false;
      }
    } catch (error) {
      Logger.error("assignmentCreate > studyRevoke > " + protocol.name);
      return false;
    }
  }
  return true;
};

exports.saveAssignments = async (protocols, user, createdBy, createdOn) => {
  let protocolsInserted = 0;
  let studyRolesUserInserted = 0;
  let success = true;
  for (let i = 0; i < protocols.length; i++) {
    const protocol = protocols[i];
    if (!protocol.roleIds || !protocol.isValid) continue;
    for (let j = 0; j < protocol.roleIds.length; j++) {
      const roleId = protocol.roleIds[j];
      const result = await this.insertUserStudyRole(
        user.usr_id,
        protocol.id,
        roleId,
        createdBy || "",
        createdOn || getCurrentTime()
      );

      if (result.success) {
        protocolsInserted += result.protocolsInserted;
        studyRolesUserInserted += result.studyRolesUserInserted;
      } else {
        Logger.error("assignmentCreate > saveToDb > " + protocol.name);
        success = false;
      }
    }
  }
  return { success, protocolsInserted, studyRolesUserInserted };
};

exports.updateAssignments = async (protocols, user, createdBy, createdOn) => {
  Logger.info({
    message: "updateAssignments - begin",
  });
  let protocolsInserted = 0;
  let studyRolesUserInserted = 0;
  let success = true;
  for (let i = 0; i < protocols.length; i++) {
    const protocol = protocols[i];
    if (!protocol.roleIds || !protocol.isValid) continue;
    for (let j = 0; j < protocol.roles.length; j++) {
      if (
        protocol.id === STUDY_IDS.ALL_STUDY ||
        protocol.id === STUDY_IDS.NO_STUDY
      ) {
        const roleId = protocol.roles[j];
        const result = await this.insertUserStudyRoleAllNone(
          user.usr_id,
          protocol.id,
          roleId,
          createdBy || "",
          createdOn || getCurrentTime()
        );
        if (!result.success) {
          Logger.error(
            "assignmentCreate > saveToDb > AllStudyNoStudy > " +
              JSON.stringify(protocol)
          );
        }
      } else {
        const roleId = protocol.roles[j];
        const result = await this.insertUserStudyRole(
          user.usr_id,
          protocol.id,
          roleId,
          createdBy || "",
          createdOn || getCurrentTime()
        );
        if (result.success) {
          protocolsInserted += result.protocolsInserted;
          studyRolesUserInserted += result.studyRolesUserInserted;
        } else {
          Logger.error("assignmentCreate > saveToDb > " + protocol.name);
          success = false;
        }
      }
    }
  }
  return { success, protocolsInserted, studyRolesUserInserted };
};

exports.makeAssignmentsInactive = async (
  protocols,
  user,
  createdBy,
  createdOn
) => {
  let flag = false;
  for (let i = 0; i < protocols.length; i++) {
    const protocol = protocols[i];
    let studyUpdateFlag = false;
    if (!protocol.roleIds || !protocol.isValid) continue;
    for (let j = 0; j < protocol.roleIds.length; j++) {
      const roleId = protocol.roleIds[j];
      const result = await this.makeUserStudyRoleInactive(
        user.usr_id,
        protocol.id,
        roleId,
        createdBy || "",
        createdOn || getCurrentTime()
      );
      if (result) {
        await insertAuditLog(
          result.prot_usr_role_id,
          "act_flg",
          1,
          0,
          createdBy,
          createdOn
        );
        flag = true;
        studyUpdateFlag = true;
      } else {
        Logger.error("assignmentCreate > saveToDb > " + protocol.protocolname);
      }
    }
    if (studyUpdateFlag)
      await studyHelper.studyUpdateModification(
        protocol.id,
        createdOn || getCurrentTime()
      );
    const result = await this.makeUserStudyInactive(
      user.usr_id,
      protocol.id,
      createdBy || "",
      createdOn || getCurrentTime()
    );
    if (result) flag = true;
  }
  return flag;
};
