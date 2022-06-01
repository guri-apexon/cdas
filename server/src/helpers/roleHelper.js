const { default: axios } = require("axios");
const DB = require("../config/db");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

/**
 * Checks whether a role exists or not
 * @param {string} role_name Role Name
 * @returns the table row on success false otherwise
 */
exports.isRoleExists = async (role_name) => {
  if (!role_name) return false;
  const query = `SELECT * FROM ${schemaName}.role WHERE UPPER(role_nm) = '${role_name.toUpperCase()}' LIMIT 1`;
  try {
    const result = await DB.executeQuery(query);
    if (result && result.rowCount > 0) return result.rows[0];
  } catch (error) {
    console.log(">>>> error:isRoleExists ", error);
  }
  return false;
};
