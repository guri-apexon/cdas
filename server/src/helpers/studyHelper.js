const DB = require("../config/db");
const axios = require("axios");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName, FSR_HEADERS, FSR_API_URI } = constants;

/**
 * Checks whether a protocol exists or not
 * @param {string} name
 * @returns the table row on success false otherwise
 */
exports.findByProtocolName = async (name) => {
  if (!name) return false;
  const query = `SELECT * FROM ${schemaName}.study WHERE prot_nbr_stnd = '${name}' LIMIT 1`;
  try {
    const result = await DB.executeQuery(query);
    if (result.rowCount > 0) return result.rows[0];
  } catch (error) {
    Logger.error("studyHelper > findByProtocolName", error);
  }
  return false;
};

exports.studyGrant = async (studyId, userIds, createdBy, createdOn) => {
  try {
    const result = await axios.post(
      `${FSR_API_URI}/study/grant`,
      {
        studyId,
        userId: createdBy,
        roUsers: userIds,
        createdOn,
      },
      {
        headers: FSR_HEADERS,
      }
    );

    if (result?.data?.code === 200) return true;
  } catch (err) {
    console.log(err);
    Logger.error("studyHelper > studyGrant", err);
  }
  return false;
};

exports.studyRevoke = async (studyId, userIds, createdBy, createdOn) => {
  try {
    const result = await axios.post(
      `${FSR_API_URI}/study/revoke`,
      {
        studyId,
        userId: createdBy,
        roUsers: userIds,
      },
      {
        headers: FSR_HEADERS,
      }
    );
    if (result?.data?.code === 200) return true;
  } catch (error) {
    Logger.error("studyHelper > studyGrant", error);
  }
  return false;
};

exports.studyUpdateModification = async (studyId, updatedOn) => {
  try {
    const result = await DB.executeQuery(
      `UPDATE ${schemaName}.study SET updt_tm='${updatedOn}' WHERE  prot_id ='${studyId}'`
    );
    return true;
  } catch (error) {}
  return false;
};

exports.getTenantIdByNemonicNull = async () => {
  const tenantQuery = `SELECT tenant_id from ${schemaName}.tenant WHERE tenant_mnemonic_nm IS null;`;
  try {
    const result = await DB.executeQuery(tenantQuery);
    return result.rows[0]?.tenant_id || null;
  } catch (error) {
    Logger.error("studyHelper > findTenantIdByNull", error);
  }
  return null;
};
