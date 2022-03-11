const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const messages = require("../config/messages");
const helpers = require("../helpers/customFunctions");
const { _ } = require("lodash");
const { DB_SCHEMA_NAME: dbSchema } = constants;

const logQuery = `INSERT INTO ${dbSchema}.audit_log (tbl_nm,id,attribute,old_val,new_val,rsn_for_chg,updated_by,updated_on) values ($1, $2, $3, $4, $5, $6, $7, $8)`;

exports.createRole = function (req, res) {
  try {
    const { name, description, policies, userId, status } = req.body;
    if (!policies?.length || !Array.isArray(policies) || !userId) {
      return apiResponse.ErrorResponse(
        res,
        "Please complete all mandatory information and then click Save"
      );
    }
    const currentTime = helpers.getCurrentTime();
    const roleValues = [
      name,
      description,
      status,
      userId,
      currentTime,
      userId,
      currentTime,
    ];
    DB.executeQuery(
      `INSERT into ${dbSchema}.role(role_nm, role_desc, role_stat, created_by, created_on, updated_by, updated_on) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      roleValues
    )
      .then((response) => {
        const role = response.rows[0];
        let queryStr = "";
        policies.forEach((policyId) => {
          queryStr += `INSERT into ${dbSchema}.role_policy(role_id, plcy_id, act_flg, created_by, created_on, updated_by, updated_on) VALUES('${role.role_id}', '${policyId}', 1, '${userId}', '${currentTime}', '${userId}', '${currentTime}');`;
        });
        DB.executeQuery(queryStr)
          .then((response) => {
            return apiResponse.successResponseWithData(
              res,
              messages.CREATE_ROLE_SUCCESS,
              {}
            );
          })
          .catch((err) => {
            return apiResponse.ErrorResponse(res, err?.detail);
          });
      })
      .catch((err) => {
        const errMessage =
          err.code == 23505 ? messages.CREATE_ROLE_UNIQUE : err.detail;
        return apiResponse.ErrorResponse(res, errMessage);
      });
  } catch (err) {
    console.log("Err", err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateRole = function (req, res) {
  try {
    const { name, description, policies, userId, status, roleId } = req.body;
    if (!name || !description || !userId || !roleId) {
      return apiResponse.ErrorResponse(
        res,
        "Please complete all mandatory information and then click Save"
      );
    }
    const currentTime = helpers.getCurrentTime();
    const roleValues = [name, description, status, userId, currentTime, roleId];
    DB.executeQuery(
      `UPDATE ${dbSchema}.role set role_nm=$1, role_desc=$2, role_stat=$3, updated_by=$4, updated_on=$5 WHERE role_id=$6 RETURNING *`,
      roleValues
    )
      .then((response) => {
        const role = response.rows[0];
        let queryStr = "";
        policies.forEach((policy) => {
          const Active = policy.value ? "1" : "0";
          if (policy.existed) {
            queryStr += `UPDATE ${dbSchema}.role_policy set act_flg='${Active}' WHERE role_plcy_id=${policy.existed};`;
          } else {
            queryStr += `INSERT into ${dbSchema}.role_policy(role_id, plcy_id, act_flg, created_by, created_on, updated_by, updated_on) VALUES('${role.role_id}', '${policy.id}', '${Active}', '${userId}', '${currentTime}', '${userId}', '${currentTime}');`;
          }
        });
        DB.executeQuery(queryStr)
          .then((response) => {
            return apiResponse.successResponseWithData(
              res,
              messages.UPDATE_ROLE_SUCCESS,
              {}
            );
          })
          .catch((err) => {
            console.log("Err", err);
            return apiResponse.ErrorResponse(res, err?.detail);
          });
      })
      .catch((err) => {
        const errMessage =
          err.code == 23505 ? messages.CREATE_ROLE_UNIQUE : err.detail;
        return apiResponse.ErrorResponse(res, errMessage);
      });
  } catch (err) {
    console.log("Err", err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getBasicList = async function (req, res) {
  try {
    let q = `SELECT R.role_id as value, R.role_nm as label FROM ${dbSchema}.role R 
    WHERE R.role_stat='1' ORDER BY R.role_nm ASC`;
    let { rows } = await DB.executeQuery(q);
    return apiResponse.successResponseWithData(res, "Operation success", rows);
  } catch (error) {
    Logger.error(error.message);
    return apiResponse.ErrorResponse(res, error.message);
  }
};

exports.listRoles = async function (req, res) {
  try {
    Logger.info({
      message: "listRoles",
    });
    let q = `SELECT distinct r.role_id,r.role_nm ,r.role_desc,r.role_stat,p2.prod_nm
    FROM ${dbSchema}."role" r
    INNER JOIN ${dbSchema}.role_policy rp
    ON r.role_id = rp.role_id
    INNER join ${dbSchema}."policy" p
    on p.plcy_id = rp.plcy_id
    inner join ${dbSchema}.policy_product_permission ppp
    on ppp.plcy_id = rp.plcy_id
    inner join ${dbSchema}.product_permission pp
    on pp.prod_permsn_id = ppp.prod_permsn_id
    inner join ${dbSchema}.product p2
    on p2.prod_id = pp.prod_id`;
    let { rows } = await DB.executeQuery(q);
    let tempRows = _.uniqBy(rows, "role_id");
    let _Products = _.uniqBy(rows, "prod_nm");
    let uniqueProducts = [];
    for (let el of _Products) {
      if (el.prod_nm !== null) {
        uniqueProducts.push(el.prod_nm);
      }
    }
    if (rows.length > 0) {
      for (let each of tempRows) {
        let products = "";
        for (let obj of rows) {
          if (each.role_id === obj.role_id) {
            if (each.prod_nm !== null && obj.prod_nm !== null) {
              if (products !== "") {
                products = products + ", " + obj.prod_nm;
              } else {
                products = obj.prod_nm;
              }
            }
          }
        }
        delete each.prod_nm;
        each.role_stat = each.role_stat === 1 ? "Active" : "Inactive";
        each.products = products;
      }
    }
    const responseBody = { roles: tempRows, uniqueProducts };
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      responseBody
    );
  } catch (error) {
    console.log(error);
    Logger.error("catch :listRoles");
    Logger.error(error.message);
    return apiResponse.ErrorResponse(res, error.message);
  }
};

exports.getDetails = async (req, res) => {
  try {
    const { roleId } = req.params;
    if (!roleId) {
      return apiResponse.ErrorResponse(res, "This role doesn't exist");
    }
    let query = `SELECT * from ${dbSchema}.role where role_id = ${roleId}`;
    const result = await DB.executeQuery(query);
    if (result.rows[0]) {
      return apiResponse.successResponseWithData(
        res,
        "Role retrieved succesfully",
        result.rows[0]
      );
    } else {
      return apiResponse.ErrorResponse(res, "This role doesn't exist");
    }
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { role_id, role_stat, userId } = req.body;
    const oldValue = role_stat === 1 ? 1 : 0;
    const currentTime = helpers.getCurrentTime();
    let query = `update ${dbSchema}.role set role_stat = '${role_stat}', updated_by = '${userId}', updated_on = '${currentTime}' where role_id = ${role_id}`;
    await DB.executeQuery(query);
    await DB.executeQuery(logQuery, [
      "role",
      role_id,
      "role_stat",
      oldValue,
      role_stat,
      userId,
      currentTime,
    ]);

    return apiResponse.successResponseWithData(res, "Update success");
  } catch (error) {
    Logger.error("catch :update status role");
    Logger.error(error.message);
    return apiResponse.ErrorResponse(res, error.message);
  }
};

exports.getRolesPermissions = async (req, res) => {
  try {
    Logger.info({ message: "getRolesPermissions" });
    const { userId, productName } = req.body;
    // sur.role_id, rp.plcy_id, p3.prod_id, p3.prod_nm, c.ctgy_id, f.feat_id, p.plcy_nm,
    const query = `select 
     c.ctgy_nm as "categoryName", f.feat_nm as "featureName", p2.permsn_nm as "allowedPermission" from ${dbSchema}.study_user_role sur
  inner join ${dbSchema}.role r on r.role_id = sur.role_id
  inner join ${dbSchema}.role_policy rp on rp.role_id = r.role_id 
  inner join ${dbSchema}."policy" p on p.plcy_id = rp.plcy_id 
  inner join ${dbSchema}.policy_product_permission ppp on p.plcy_id = ppp.plcy_id 
  inner join ${dbSchema}.product_permission pp on ppp.prod_permsn_id = pp.prod_permsn_id 
  inner join ${dbSchema}."permission" p2 on pp.permsn_id = p2.permsn_id 
  inner join ${dbSchema}.product p3 on pp.prod_id = p3.prod_id 
  inner join ${dbSchema}.category c on pp.ctgy_id = c.ctgy_id 
  inner join ${dbSchema}.feature f on pp.feat_id = f.feat_id 
  where sur.usr_id = $1 and p3.prod_nm = $2 and p.plcy_stat = 'Active' and r.role_stat = 1 and rp.act_flg = 1 and ppp.act_flg = 1 and pp.act_flg =1 and f.act_flg =1 and c.act_flg = 1`;

    const $q1 = await DB.executeQuery(query, [userId, productName]);

    const uniquePermissions = await _.uniqWith($q1.rows, _.isEqual);

    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      uniquePermissions
    );
  } catch (err) {
    Logger.error("catch :getRolesPermissions");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
