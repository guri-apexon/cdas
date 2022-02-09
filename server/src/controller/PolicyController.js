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
    DB.executeQuery(
      `INSERT into ${constants.DB_SCHEMA_NAME}.policy(plcy_nm, plcy_desc, plcy_stat, created_by, created_on, updated_by, updated_on) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      policyValues
    )
      .then((response) => {
        const policy = response.rows[0];
        let permissionQuery = "";
        productsArr.forEach((product, i) => {
          const productPermission = permissions[product];
          if (productPermission.length) {
            productPermission.forEach((category) => {
              Object.keys(category.permsn_nm).forEach((permissionName) => {
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
        DB.executeQuery(permissionQuery)
          .then((response) => {
            return apiResponse.successResponseWithData(
              res,
              "Added Successfully",
              []
            );
          })
          .catch((err) => {
            return apiResponse.ErrorResponse(res, err.detail);
          });
      })
      .catch((err) => {
        const errMessage = err.code==23505 ? "Policy Name should be unique - Please update the name and Save again" : err.detail;
        return apiResponse.ErrorResponse(res, errMessage);
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
    const policyValues = [
      policyName,
      policyDesc,
      status,
      userId,
      currentTime,
      policyId
    ];
    DB.executeQuery(`UPDATE ${constants.DB_SCHEMA_NAME}.policy set plcy_nm=$1, plcy_desc=$2, plcy_stat=$3, updated_by=$4, updated_on=$5 WHERE plcy_id=$6 RETURNING *`, policyValues).then((response) => {
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
      DB.executeQuery(permissionQuery).then((response) => {
        return apiResponse.successResponseWithData(res, "Updated Successfully", []);
      }).catch(err=>{
        return apiResponse.ErrorResponse(res, err.detail);
      });
    }).catch(err=>{
      console.log("err", err);
      return apiResponse.ErrorResponse(res, err.detail);
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getProducts = function (req, res) {
  try {
    const searchQuery = `select distinct p.prod_nm, p.prod_id, p.act_flg,
    case when pp.prod_id is null then 0 else 1 end as active_product from ${constants.DB_SCHEMA_NAME}.product p
    FULL OUTER JOIN ${constants.DB_SCHEMA_NAME}.product_permission pp on (pp.prod_id=p.prod_id)
    ORDER By p.prod_id ASC`;
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

exports.getSnapshot = function (req, res) {
  try {
    const {policyId} = req.params;
    if(!policyId) return apiResponse.ErrorResponse(res, 'Policy not found');
    
    const searchQuery = `select row_number() over(order by prod_nm asc) as indx ,prod_nm,ctgy_nm ,feat_nm ,permsn_nm , plcy_prod_permsn_id
    from (select distinct p2.prod_nm ,c.ctgy_nm ,f.feat_nm ,p.permsn_nm , ppp.plcy_prod_permsn_id
    from ${constants.DB_SCHEMA_NAME}.product_permission pp
    left outer join ${constants.DB_SCHEMA_NAME}.policy_product_permission ppp on (pp.prod_permsn_id=ppp.prod_permsn_id and ppp.plcy_id='${policyId}' and ppp.act_flg=1)
    left outer join ${constants.DB_SCHEMA_NAME}.category c on (c.ctgy_id=pp.ctgy_id)
    left outer join ${constants.DB_SCHEMA_NAME}.feature f on (f.feat_id=pp.feat_id)
    left outer join ${constants.DB_SCHEMA_NAME}."permission" p on (p.permsn_id=pp.permsn_id)
    left outer join ${constants.DB_SCHEMA_NAME}.product p2 on (p2.prod_id=pp.prod_id) WHERE ppp.plcy_prod_permsn_id is not null) oprd;`;
    DB.executeQuery(searchQuery).then(async (response) => {
      let permissions = response?.rows || [];
      if(permissions?.length){
        const helper = {};
        permissions = permissions.reduce((r, o) => {
          const key = `${o.prod_nm}: ${o.feat_nm}`;
          if (!helper[key]) {
            helper[key] = {
              label: key,
              category: [{ name: o.ctgy_nm, values: [o.permsn_nm] }],
            };
            r.push(helper[key]);
          } else {
            const filtered = helper[key].category.find((x) => x.name === o.ctgy_nm);
            if (filtered) {
              filtered.values.push(o.permsn_nm);
            } else {
              helper[key] = {
                ...helper[key],
                category: [
                  ...helper[key].category,
                  {
                    name: o.ctgy_nm,
                    values: [o.permsn_nm],
                  },
                ],
              };
            }
          }
          return r;
        }, []);
      }
      return apiResponse.successResponseWithData(
        res,
        "Snapshot retrieved successfully",
        permissions
      );
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.listPermission = function (req, res) {
  try {
    const {policyId} = req.params;
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
    if(req.method==="GET"){
      const query = `select distinct p.plcy_nm as "policyName", p.plcy_desc as "policyDescription", p.plcy_id as "policyId", string_agg(distinct p2.prod_nm, ', ') AS products, p.plcy_stat as "policyStatus" from ${constants.DB_SCHEMA_NAME}."policy" p
      inner join ${constants.DB_SCHEMA_NAME}.policy_product_permission ppp on (p.plcy_id=ppp.plcy_id)
      inner JOIN ${constants.DB_SCHEMA_NAME}.product_permission pp ON ppp.prod_permsn_id = pp.prod_permsn_id
      inner JOIN ${constants.DB_SCHEMA_NAME}.product p2 ON p2.prod_id = pp.prod_id
      where ppp.act_flg =1
      GROUP  BY p.plcy_id;`;
      const $q1 = await DB.executeQuery(query);
      const products = [];
      await $q1.rows.forEach(function (obj) {
        var str = obj.products.split(",");
        str.forEach(function (v) {
          var user = v.trim();
          if (products.indexOf(user) === -1) products.push(user);
        });
      });
      return apiResponse.successResponseWithData(res, "Policy retrieved successfully", {
        policyList: $q1.rows,
        uniqueProducts: products,
      });
    }else{
      // const query = `select p.plcy_nm as "policyName", p.plcy_desc as "policyDescription", p.plcy_id as "policyId", p2.prod_nm as "productName", p.plcy_stat as "policyStatus" from ${constants.DB_SCHEMA_NAME}."policy" p
      // inner join ${constants.DB_SCHEMA_NAME}.policy_product pp on (pp.plcy_id=p.plcy_id)
      // inner join ${constants.DB_SCHEMA_NAME}.product p2 on (pp.prod_id=p2.prod_id)
      // where pp.act_flg =1`;
  
      const query = `select distinct p.plcy_nm as "policyName", p.plcy_desc as "policyDescription", p.plcy_id as "policyId", p2.prod_nm as "productName", p.plcy_stat as "policyStatus" from ${constants.DB_SCHEMA_NAME}."policy" p
      inner join ${constants.DB_SCHEMA_NAME}.policy_product_permission ppp on (p.plcy_id=ppp.plcy_id)
      inner JOIN ${constants.DB_SCHEMA_NAME}.product_permission pp ON ppp.prod_permsn_id = pp.prod_permsn_id
      inner JOIN ${constants.DB_SCHEMA_NAME}.product p2 ON p2.prod_id = pp.prod_id
      where ppp.act_flg =1`;
  
      const $q1 = await DB.executeQuery(query);
      const uniqueProducts = await $q1.rows
        .map((e) => e.productName)
        .filter((it, i, ar) => ar.indexOf(it) === i);
      return apiResponse.successResponseWithData(res, "Operation success", {
        policyList: $q1.rows,
        uniqueProducts,
      });
    }
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :getPolicyList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
