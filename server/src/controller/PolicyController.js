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
    where pp.act_flg =1;`;

    const $q1 = await DB.executeQuery(query);

    // $q1.map()

    
    // const formatDateValues = await $q1.rows.map((e) => {
    //   let acc = $q2.rows.filter((d) => d.prot_id === e.prot_id);
    //   let newObj = acc[0] ? acc[0] : { count: 0 };
    //   let { count } = newObj;
    //   let editT = moment(e.dateedited).format("MM/DD/YYYY");
    //   let addT = moment(e.dateadded).format("MM/DD/YYYY");
    //   let newData = _.omit(e, ["prot_id"]);
    //   return {
    //     ...newData,
    //     dateadded: addT,
    //     dateedited: editT,
    //     assignmentcount: count,
    //   };
    // });



    return apiResponse.successResponseWithData(res, "Operation success", $q1);

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
