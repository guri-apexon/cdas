const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const constants = require("../config/constants");
// const moment = require("moment");
// const _ = require("lodash");

exports.getPolicyList = async (req, res) => {
  try {
    Logger.info({ message: "getPolicyList" });
    // const query = `select p.plcy_nm as "policyName", p.plcy_desc as "policyDescription", p.plcy_id as "policyId", p2.prod_nm as "productName", p.plcy_stat as "policyStatus" from ${constants.DB_SCHEMA_NAME}."policy" p
    // inner join ${constants.DB_SCHEMA_NAME}.policy_product pp on (pp.plcy_id=p.plcy_id)
    // inner join ${constants.DB_SCHEMA_NAME}.product p2 on (pp.prod_id=p2.prod_id)
    // where pp.act_flg =1`;

    const query = `select distinct p.plcy_nm as "policyName", p.plcy_desc as "policyDescription", p.plcy_id as "policyId", p2.prod_nm as "productName", p.plcy_stat as "policyStatus" from ${constants.DB_SCHEMA_NAME}."policy" p
    inner join ${constants.DB_SCHEMA_NAME}.policy_product_permission ppp on (p.plcy_id=ppp.plcy_id)
    inner JOIN ${constants.DB_SCHEMA_NAME}.product_permission pp ON ppp.prod_permsn_id = pp.prod_permsn_id
    JOIN ${constants.DB_SCHEMA_NAME}.product p2 ON p2.prod_id = pp.prod_id
    where ppp.act_flg =1`;

    const $q1 = await DB.executeQuery(query);

    const uniqueProducts = await $q1.rows
      .map((e) => e.productName)
      .filter((it, i, ar) => ar.indexOf(it) === i);

    return apiResponse.successResponseWithData(res, "Operation success", {
      policyList: $q1.rows,
      uniqueProducts,
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :getPolicyList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
