const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const moment = require("moment");
const constants = require('../config/constants');

exports.createPolicy = function (req, res) {
    try {
      const { policyName, policyDesc } = req.body;
      console.log("policyName, policyDesc", policyName, policyDesc);
      const searchQuery = ``;
      DB.executeQuery(searchQuery).then((response) => {
        const studies = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", []);
      });
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  };
  exports.listPermission = function (req, res) {
    try {
      const searchQuery = `select distinct p2.prod_nm ,c.ctgy_nm ,f.feat_nm ,p.permsn_nm ,
      case when ppp.plcy_prod_permsn_id is not null then '1' else '0' end as checkbox_status
      from ${constants.DB_SCHEMA_NAME}.product_permission pp 
      left outer join ${constants.DB_SCHEMA_NAME}.policy_product_permission ppp on (pp.prod_permsn_id=ppp.prod_permsn_id and ppp.act_flg=1 )
      left outer join ${constants.DB_SCHEMA_NAME}.category c on (c.ctgy_id=pp.ctgy_id)
      left outer join ${constants.DB_SCHEMA_NAME}.feature f on (f.feat_id=pp.feat_id)
      left outer join ${constants.DB_SCHEMA_NAME}."permission" p on (p.permsn_id=pp.permsn_id)
      left outer join ${constants.DB_SCHEMA_NAME}.product p2 on (p2.prod_id=pp.prod_id);
      `;
      DB.executeQuery(searchQuery).then((response) => {
        const permissions = response?.rows || [];
        return apiResponse.successResponseWithData(res, "Permissions retrieved successfully", permissions);
      });
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  };

