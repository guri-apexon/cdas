const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const constants = require("../config/constants");
const { _ } = require("lodash");

exports.createRole = function (req, res) {
  try {
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.listRoles = async function (req, res) {
  try {
    Logger.info({
      message: "listRoles",
    });
    let q = `SELECT r.role_id,r.role_nm ,r.role_desc,r.role_stat,p2.prod_nm 
    FROM cdascfg."role" r 
    INNER JOIN cdascfg.role_policy rp 
    ON r.role_id = rp.role_id
    inner join cdascfg.policy_product pp 
    on pp.plcy_id = rp.plcy_id 
    inner join cdascfg.product p2 
    on p2.prod_id = pp.prod_id`;
    let { rows } = await DB.executeQuery(q);
    let tempRows = _.uniqBy(rows, "role_id");
    let _Products = _.uniqBy(rows, "prod_nm");
    let uniqueProducts = [];
    for (let el of _Products) {
      uniqueProducts.push(el.prod_nm);
    }
    if (rows.length > 0) {
      for (let each of tempRows) {
        let products = "";
        for (let obj of rows) {
          if (each.role_id === obj.role_id) {
            if (products !== "") {
              products = products + ", " + obj.prod_nm;
            } else {
              products = obj.prod_nm;
            }
          }
        }
        delete each.prod_nm;
        each.role_stat = each.role_stat === "1" ? "active" : "Inactive";
        each.products = products ? products : [];
      }
    }
    const responseBody = { roles: tempRows, uniqueProducts };
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      responseBody
    );
  } catch (error) {
    Logger.error("catch :listRoles");
    Logger.error(error.message);
    return apiResponse.ErrorResponse(res, error.message);
  }
};
