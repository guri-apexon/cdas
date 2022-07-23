const DB = require("../config/db");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

/**
 * Checks if a tenant exists
 * @param {string} tenant_nm Name of the tenant
 * @returns returns tenant_id, false otherwise
 */
exports.findByName = async (tenant_nm) => {
  // const query = `SELECT tenant_id FROM ${schemaName}.tenant WHERE tenant_nm = '${tenant_nm}' LIMIT 1`;
  const query = `SELECT tenant_id FROM ${schemaName}.tenant WHERE tenant_mnemonic_nm is null LIMIT 1`;
  try {
    const result = await DB.executeQuery(query);
    if (result.rowCount > 0) return result.rows[0].tenant_id;
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Inserts the user_id and tenant id in user_tenant table, skips if its already present
 * @param {string} usr_id
 * @param {string} tenant_id
 * @returns true on success, false otherwise
 */
exports.insertTenantUser = async (usr_id, tenant_id) => {
  const queryCheckIfExists = `SELECT tenant_id FROM ${schemaName}.user_tenant where tenant_id = '${tenant_id}' AND usr_id = '${usr_id}'`;
  const queryInsertUserTenant = `INSERT INTO ${schemaName}.user_tenant(tenant_id, usr_id) VALUES('${tenant_id}', '${usr_id}')`;
  try {
    const result1 = await DB.executeQuery(queryCheckIfExists);
    if (result1.rowCount > 0) return true;
    const result2 = await DB.executeQuery(queryInsertUserTenant);
    if (result2.rowCount > 0) return true;
    return false;
  } catch (error) {
    console.log(
      "error: insertTenantUser",
      queryCheckIfExists,
      queryInsertUserTenant,
      error
    );
    return false;
  }
};

exports.getFirstTenant = async () => {
  // Fetch First Tenet
  // const query = `SELECT tenant_nm, tenant_id FROM ${schemaName}.tenant LIMIT 1`;
  const query = `SELECT tenant_nm, tenant_id FROM ${schemaName}.tenant WHERE tenant_mnemonic_nm is null LIMIT 1`;
  try {
    const result = await DB.executeQuery(query);
    if (result.rowCount > 0) {
      return result.rows[0];
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
