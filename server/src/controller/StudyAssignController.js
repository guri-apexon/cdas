const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const constants = require("../config/constants");
const helpers = require("../helpers/customFunctions");
const { Console } = require("winston/lib/winston/transports");

const { DB_SCHEMA_NAME: schemaName } = constants;

exports.listStudyAssign = async (req, res) => {
  try {
    const protocol = req.body.protocol;

    const getQuery = `SELECT t1.prot_id,t1.usr_id,t2.usr_fst_nm,t2.usr_lst_nm,t2.usr_mail_id 
                        FROM ${schemaName}.study_user as t1 
                        LEFT JOIN ${schemaName}.user as t2 ON t1.usr_id = t2.usr_id 
                        where t1.prot_id =$1 and t1.act_flg =1`;

    const getRole = `SELECT t1.role_id,t1.prot_id,t1.usr_id,t2.role_nm ,t2.role_desc 
                      FROM ${schemaName}.study_user_role as t1
                      LEFT JOIN ${schemaName}.role as t2 ON t1.role_id = t2.role_id
                      where t1.prot_id =$1 and t1.usr_id=$2 and t1.act_flg =1`;

    Logger.info({ message: "getENSList" });

    const list = await DB.executeQuery(getQuery, [protocol]);
    for (const item of list.rows) {
      let roles = await DB.executeQuery(getRole, [protocol, item.usr_id]);
      item.roles = roles.rows;
    }

    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      list.rows
    );
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :getENSList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.AddStudyAssign = async (req, res) => {
  try {
    const { protocol, loginId, data } = req.body;
    const curDate = helpers.getCurrentTime();

    const insertUserQuery = `INSERT INTO ${schemaName}.study_user (prot_id,usr_id,act_flg,insrt_tm)
                              VALUES($1,$2,$3,$4)`;
    const insertRoleQuery = `INSERT INTO ${schemaName}.study_user_role 
                              (role_id,prot_id,usr_id,act_flg,created_by,created_on)
                              VALUES($1,$2,$3,$4,$5,$6)`;

    Logger.info({ message: "AddStudyAssignRole" });

    data.forEach(async (element) => {
      try {
        // console.log(element.user_id);
        const AddUser = await DB.executeQuery(insertUserQuery, [
          protocol,
          element.user_id,
          1,
          curDate,
        ]);

        element.role_id.forEach(async (roleId) => {
          try {
            // console.log(roleId);
            const AddRole = await DB.executeQuery(insertRoleQuery, [
              roleId,
              protocol,
              element.user_id,
              1,
              loginId,
              curDate,
            ]);
          } catch (e) {
            console.log(e);
          }
        });
      } catch (err) {
        console.log(err);
      }
    });

    return apiResponse.successResponseWithData(
      res,
      "New user Added successfully"
    );
    // for (const item in user_id) {
    //   console.log(user_id[item]);
    //   const AddUser = await DB.executeQuery(insertUserQuery, [
    //     protocol,
    //     user_id[item],
    //     1,
    //     curDate,
    //   ]);
    // }
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :AddStudyAssignRole");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateStudyAssign = async (req, res) => {
  try {
    const { protocol, loginId, data } = req.body;
    const curDate = helpers.getCurrentTime();

    const roleUpdateQuery = `UPDATE ${schemaName}.study_user_role SET act_flg =0,updated_by=$4,
                        updated_on=$5 WHERE prot_id =$1 and usr_id = $2 and role_id <> ALL ($3);`;

    const roleGetQuery = `SELECT * FROM ${schemaName}.study_user_role  WHERE prot_id =$1 and usr_id = $2 and
                                            role_id = $3`;

    const insertRoleQuery = `INSERT INTO ${schemaName}.study_user_role
                                                  (role_id,prot_id,usr_id,act_flg,created_by,created_on)
                                                  VALUES($1,$2,$3,$4,$5,$6)`;

    Logger.info({ message: "updateStudyAssignRole" });

    data.forEach(async (element) => {
      try {
        // console.log(element.role_id);
        const roleUpdate = await DB.executeQuery(roleUpdateQuery, [
          protocol,
          element.user_id,
          element.role_id,
          loginId,
          curDate,
        ]);

        element.role_id.forEach(async (rollID) => {
          try {
            const roleGet = await DB.executeQuery(roleGetQuery, [
              protocol,
              element.user_id,
              rollID,
            ]);

            if (roleGet.rows.length == 0) {
              const roleInsert = await DB.executeQuery(insertRoleQuery, [
                rollID,
                protocol,
                element.user_id,
                1,
                loginId,
                curDate,
              ]);
            }
          } catch (e) {
            console.log(e);
          }
        });
      } catch (err) {
        console.log(err);
      }
    });

    return apiResponse.successResponse(res, "update successfully");
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :updateStudyAssignRole");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.deleteStudyAssign = async (req, res) => {
  try {
    const { protocol, loginId, user_id } = req.body;
    const curDate = helpers.getCurrentTime();

    const userDeleteQuery = `UPDATE ${schemaName}.study_user SET act_flg =0,updt_tm=$3 WHERE prot_id =$1 and usr_id = $2`;

    const roleDeleteQuery = `UPDATE ${schemaName}.study_user_role SET act_flg =0,updated_by=$3,
                            updated_on=$4 WHERE prot_id =$1 and usr_id =$2`;

    Logger.info({ message: "deleteStudyAssignRole" });

    user_id.forEach(async (id) => {
      try {
        const userDelete = await DB.executeQuery(userDeleteQuery, [
          protocol,
          id,
          curDate,
        ]);

        const deleteRole = await DB.executeQuery(roleDeleteQuery, [
          protocol,
          id,
          loginId,
          curDate,
        ]);

        return apiResponse.successResponse(res, "User Deleted successfully");
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :deleteStudyAssignRole");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
