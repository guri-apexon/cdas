const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const constants = require("../config/constants");

exports.createPolicy = function (req, res) {
  try {
    const { policyName, policyDesc, permissions, userId, status } = req.body;
    const productsArr = Object.keys(permissions);
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    const policyValues = [
      policyName,
      policyDesc,
      status,
      userId,
      currentTime,
      userId,
      currentTime,
    ];
    DB.executeQuery(`INSERT into ${constants.DB_SCHEMA_NAME}.policy(plcy_nm, plcy_desc, plcy_stat, created_by, created_on, updated_by, updated_on) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`, policyValues).then((response) => {
      const policy = response.rows[0];
      let permissionQuery = '';
      productsArr.forEach((product, i)=>{
        const productPermission = permissions[product];
        if(productPermission.length){
          productPermission.forEach((category)=>{
            Object.keys(category.permsn_nm).forEach((permissionName)=>{
              if(category.permsn_nm[permissionName]){
                permissionQuery += `INSERT into ${constants.DB_SCHEMA_NAME}.policy_product_permission(plcy_id, prod_permsn_id, act_flg, created_by, created_on, updated_by, updated_on)
                select distinct ${policy.plcy_id}, pp.prod_permsn_id, 1, '${userId}', current_timestamp, '${userId}', current_timestamp from ${constants.DB_SCHEMA_NAME}.product_permission pp
                left join ${constants.DB_SCHEMA_NAME}.product p2 on (pp.prod_id=p2.prod_id)
                left join ${constants.DB_SCHEMA_NAME}.category c on (c.ctgy_id=pp.ctgy_id)
                left join ${constants.DB_SCHEMA_NAME}.feature f on (f.feat_id=pp.feat_id)
                left join ${constants.DB_SCHEMA_NAME}."permission" p on (p.permsn_id=pp.permsn_id)
                where p2.prod_nm ='${product}' and c.ctgy_nm ='${category.ctgy_nm}' and f.feat_nm ='${category.feat_nm}' and p.permsn_nm ='${permissionName}';`;
              }
            });
          });
        }
      });
      DB.executeQuery(permissionQuery).then((response) => {
        return apiResponse.successResponseWithData(res, "Added Successfully", []);
      }).catch(err=>{
        return apiResponse.ErrorResponse(res, err.detail);
      });
    }).catch(err=>{
      return apiResponse.ErrorResponse(res, err.detail);
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};


exports.updatePolicy = function (req, res) {
  try {
    const { policyName, policyDesc, permissions, userId, status, policyId } = req.body;
    const productsArr = Object.keys(permissions);
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    DB.executeQuery(`UPDATE ${constants.DB_SCHEMA_NAME}.policy set plcy_nm='${policyName}', plcy_desc='${policyDesc}', plcy_stat='${status}', updated_by='${userId}', updated_on='${currentTime}' WHERE plcy_id='${policyId}' RETURNING *`).then((response) => {
      const policy = response.rows[0];
      let permissionQuery = '';
      productsArr.forEach((product, i)=>{
        const productPermission = permissions[product];
        if(productPermission.length){
          productPermission.forEach((category)=>{
            category.permsn_nm.forEach((permission)=>{
              if(permission.updated){
                if(permission.id){
                  permissionQuery += `UPDATE ${constants.DB_SCHEMA_NAME}.policy_product_permission set act_flg=${permission.value ? '1' : 'null'} WHERE plcy_prod_permsn_id=${permission.id};`;
                }else{
                  if(permission.value){
                    permissionQuery += `INSERT into ${constants.DB_SCHEMA_NAME}.policy_product_permission(plcy_id, prod_permsn_id, act_flg, created_by, created_on, updated_by, updated_on)
                    select distinct ${policy.plcy_id}, pp.prod_permsn_id, 1, '${userId}', current_timestamp, '${userId}', current_timestamp from ${constants.DB_SCHEMA_NAME}.product_permission pp
                    left join ${constants.DB_SCHEMA_NAME}.product p2 on (pp.prod_id=p2.prod_id)
                    left join ${constants.DB_SCHEMA_NAME}.category c on (c.ctgy_id=pp.ctgy_id)
                    left join ${constants.DB_SCHEMA_NAME}.feature f on (f.feat_id=pp.feat_id)
                    left join ${constants.DB_SCHEMA_NAME}."permission" p on (p.permsn_id=pp.permsn_id)
                    where p2.prod_nm ='${product}' and c.ctgy_nm ='${category.ctgy_nm}' and f.feat_nm ='${category.feat_nm}' and p.permsn_nm ='${permission.name}';`;
                  }
                }
              }
            });
          });
        }
      });
      console.log("permissionQuery", permissionQuery);
      DB.executeQuery(permissionQuery).then((response) => {
        return apiResponse.successResponseWithData(res, "Added Successfully", []);
      }).catch(err=>{
        return apiResponse.ErrorResponse(res, err.detail);
      });
    }).catch(err=>{
      return apiResponse.ErrorResponse(res, err.detail);
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getProducts = function (req, res) {
  try {
    const searchQuery = `select * from ${constants.DB_SCHEMA_NAME}.product p`;
    DB.executeQuery(searchQuery).then((response) => {
      const products = response?.rows || [];
      return apiResponse.successResponseWithData(
        res,
        "Products retrieved successfully",
        products
      );
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};
exports.listPermission = function (req, res) {
  try {
    const {policyId} = req.params;
    console.log("policyId", policyId);
    const searchQuery = `select row_number() over(order by prod_nm asc) as indx ,prod_nm,ctgy_nm ,feat_nm ,permsn_nm ,select_check_box, plcy_prod_permsn_id
    from (select distinct p2.prod_nm ,c.ctgy_nm ,f.feat_nm ,p.permsn_nm , ppp.plcy_prod_permsn_id,
    case when ppp.plcy_prod_permsn_id is not null ${(policyId ? "and ppp.act_flg='1'" : '')} then '1' else '0' end as select_check_box
    from ${constants.DB_SCHEMA_NAME}.product_permission pp
    left outer join ${constants.DB_SCHEMA_NAME}.policy_product_permission ppp on (pp.prod_permsn_id=ppp.prod_permsn_id and ${(policyId ? `ppp.plcy_id='${policyId}'` : 'ppp.act_flg=1')} )
    left outer join ${constants.DB_SCHEMA_NAME}.category c on (c.ctgy_id=pp.ctgy_id)
    left outer join ${constants.DB_SCHEMA_NAME}.feature f on (f.feat_id=pp.feat_id)
    left outer join ${constants.DB_SCHEMA_NAME}."permission" p on (p.permsn_id=pp.permsn_id)
    left outer join ${constants.DB_SCHEMA_NAME}.product p2 on (p2.prod_id=pp.prod_id)) oprd;`;
    DB.executeQuery(searchQuery).then(async (response) => {
      const permissions = response?.rows || [];
      if(policyId){
        await DB.executeQuery(`SELECT * from ${constants.DB_SCHEMA_NAME}.policy WHERE plcy_id=${policyId}`).then((policyRes) => {
          return apiResponse.successResponseWithData(
            res,
            "Permissions retrieved successfully",
            {
              policyDetails: policyRes.rows[0],
              data: permissions
            }
          );
        });
      }else{
        return apiResponse.successResponseWithData(
          res,
          "Permissions retrieved successfully",
          permissions
        );
      }
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

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
