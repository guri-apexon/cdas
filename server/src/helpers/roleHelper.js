const { default: axios } = require("axios");
const DB = require("../config/db");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.CONSTANTS = {
  INACTIVE: "INACTIVE",
  ACTIVE: "ACTIVE",
};

/**
 * Checks whether a role exists or not
 * @param {string} role_name Role Name
 * @returns the table row on success false otherwise
 */
exports.findByName = async (role_name) => {
  if (!role_name) return false;
  const query = `SELECT * FROM ${schemaName}.role WHERE UPPER(role_nm) = '${role_name.toUpperCase()}' LIMIT 1`;
  try {
    const result = await DB.executeQuery(query);
    if (result && result.rowCount > 0) return result.rows[0];
  } catch (error) {
    Logger.error("roleHelper > findByName", error);
  }
  return false;
};
