const DB = require("../config/db");
const { validateEmail, getCurrentTime } = require("./customFunctions");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const studyHelper = require("./studyHelper");
const roleHelper = require("./roleHelper");
const { DB_SCHEMA_NAME: schemaName } = constants;

// study_user_role_audit_log
//UPDATE cdascfg.study_user_role_audit_log
// SET prot_usr_role_id='1472252', "attribute"='New Entry', old_val=NULL, new_val=NULL, rsn_for_chg='User Requested', updated_by='u1120581', updated_on='2022-06-06 21:40:47.000';
//INSERT INTO cdascfg.study_user_role_audit_log
//(prot_usr_role_id, "attribute", old_val, new_val, rsn_for_chg, updated_by, updated_on)
// VALUES('1433252', 'New Entry', NULL, NULL, 'User Requested', 'u1120581', '2022-06-06 21:11:58.000');

const { DB_DATABASE } = require("../config/constants");
const logger = require("../config/logger");

exports.insertAuditLog = async (
  prot_usr_role_id,
  attribute,
  old_val,
  new_val,
  updated_by,
  updated_on
) => {
  const rsn_for_chg = "User Requested";
  const query = `INSERT INTO cdascfg.study_user_role_audit_log
  (prot_usr_role_id, "attribute", old_val, new_val, rsn_for_chg, updated_by, updated_on)
  VALUES($1, $2, $3, $4, $5, $6, $7);
  `;

  try {
    const result = await DB.executeQuery(query, [
      prot_usr_role_id,
      attribute,
      old_val,
      new_val,
      rsn_for_chg,
      updated_by,
      updated_on,
    ]);
    if (result.rowCount > 0) return true;
  } catch (error) {
    Logger.error("studyUserroleHelper > insertAuditLog", error);
  }
  return false;
};
