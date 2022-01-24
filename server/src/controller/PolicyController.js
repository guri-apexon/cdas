const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");

exports.getPolicyList = async (req, res) => {
  try {
    Logger.info({ message: "getPolicyList" });

    const query = `select p.plcy_nm as "policyName", p.plcy_desc as "policyDescription", p.plcy_id as "policyId", p2.prod_nm as "productName", p.plcy_stat as "policyStatus" from cdascore."policy" p 
    inner join cdascore.policy_product pp on (pp.plcy_id=p.plcy_id)
    inner join cdascore.product p2 on (pp.prod_id=p2.prod_id)
    where pp.act_flg =1`;

    const $q1 = await DB.executeQuery(query);

    // const uniqueProducts = [];

    const uniqueProducts = await $q1.rows
      .map((e) => e.productName)
      .filter((it, i, ar) => ar.indexOf(it) === i);

    // const formatDateValues = await $q1.rows.reduce((e) => {

    // });

    return apiResponse.successResponseWithData(res, "Operation success", {
      polciyList: $q1.rows,
      uniqueProducts,
    });

    // .then((response) => {
    //   const studies = response.rows || [];
    //   if (studies.length > 0) {
    //     return apiResponse.successResponseWithData(
    //       res,
    //       "Operation success",
    //       studies
    //     );
    //   } else {
    //     return apiResponse.successResponseWithData(
    //       res,
    //       "Operation success",
    //       []
    //     );
    //   }
    // });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :getPolicyList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
