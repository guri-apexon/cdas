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
exports.isProtocolExists = async (name) => {
  if (!name) return false;
  const query = `SELECT * FROM ${schemaName}.study WHERE prot_nbr_stnd = '${name}' LIMIT 1`;
  try {
    const result = await DB.executeQuery(query);
    if (result.rowCount > 0) return result.rows[0];
  } catch (error) {
    console.log(">>>> error: is protocol exists ", error);
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
  } catch (error) {
    console.log("Error: studygrant", error);
  }
  return false;
};
