const DB = require("../config/db");
const Logger = require("../config/logger");
const schemaName = process.env.SCHEMA;

exports.isTenantExists = async (tenant_nm) => {
  const query = `SELECT tenant_id FROM ${schemaName}.tenant WHERE tenant_nm = '${tenant_nm}' LIMIT 1`;
  try {
    const result = await DB.executeQuery(query);
    console.log("success: isTenantExists", result);
    if (result.rowCount > 0) return result.rows[0].tenant_id;
    return false;
  } catch (error) {
    console.log("error: isTenantExists", error);
    return false;
  }
};
exports.insertTenantUser = async (usr_id, tenant_id) => {
  const queryCheckIfExists = `SELECT tenant_id FROM ${schemaName}.user_tenant where tenant_id = '${tenant_id}' AND usr_id = '${usr_id}'`;
  const queryInsertUserTenant = `INSERT INTO ${schemaName}.user_tenant(tenant_id, usr_id) VALUES('${tenant_id}', '${usr_id}')`;
  try {
    const result1 = await DB.executeQuery(queryCheckIfExists);
    console.log(
      "success result 1: insertTenantUser",
      queryCheckIfExists,
      result1
    );
    if (result1.rowCount > 0) return true;
    const result2 = await DB.executeQuery(queryInsertUserTenant);
    console.log(
      "success result 2: insertTenantUser",
      queryInsertUserTenant,
      result2
    );
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
