const DB = require("../config/db");
const { getCurrentTime } = require("./customFunctions");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.find = async (tableName, filter, orderby, limit) => {
  const sql = `   
    SELECT * FROM ${schemaName}.${tableName} 
    WHERE ${filter}
    ${orderby ? `ORDER ${orderby}` : ""}
    ${limit ? `LIMIT ${limit}` : ""}
  `;

  try {
    const response = await DB.executeQuery(sql);
    return (response && response.rowCount > 0 && response.rows) || [];
  } catch (error) {
    Logger.error(`commonHelper > find (${schemaName}.${tableName})`, error);
  }
  return [];
};

exports.findFirst = async (tableName, filter, orderby) =>
  await this.find(tableName, filter, orderby, 1);

exports.isValidDate = (dateObject) =>
  new Date(dateObject).toString() !== "Invalid Date";

exports.isFutureDate = (dateObject) => new Date(dateObject) > new Date();
