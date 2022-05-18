const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const _ = require("lodash");
const constants = require("../config/constants");
const helpers = require("../helpers/customFunctions");

const { DB_SCHEMA_NAME: schemaName } = constants;

const contactInsert = `INSERT INTO ${schemaName}.vendor_contact (vend_id, contact_nm, emailid, created_by, created_on, updated_by, updated_on, act_flg) VALUES($1, $2, $3, $4, $5, $4, $5, 1)`;
const logQuery = `INSERT INTO ${schemaName}.audit_log (tbl_nm,id,attribute,old_val,new_val,rsn_for_chg,updated_by,updated_on) values ($1, $2, $3, $4, $5, $6, $7, $8)`;

async function getCurrentVendor(vId) {
  const { rows } = await DB.executeQuery(
    `SELECT * FROM ${schemaName}.vendor where vend_id = $1`,
    [vId]
  );
  return rows[0];
}

exports.getVendorsList = async (req, res) => {
  try {
    Logger.info({ message: "vendorList" });

    let query = `select v.vend_id as "vId", vend_nm as "vName", vend_nm_stnd as "vNStd", description as "vDescription", active as "status", extrnl_sys_nm as "vESN", vc.Ven_Contact_nm as "vContactName" from ${schemaName}.vendor v 
    left join (select vc.vend_id , string_agg(vc.contact_nm,', ') as Ven_Contact_nm from ${schemaName}.vendor_contact vc where act_flg =1 group by vc.vend_id) vc on v.vend_id =vc.vend_id`;

    let dbQuery = await DB.executeQuery(query);

    const vendors = await dbQuery.rows.map((e) => {
      e.vStatus = e.status === 1 ? "Active" : "Inactive";
      let newData = _.omit(e, ["status"]);
      return newData;
    });

    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      vendors
    );
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :vendorList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const id = parseInt(req.params.vendor_id);
    Logger.info({
      message: "getVendorById",
    });

    const query = `SELECT v.vend_id as "vId", vend_nm as "vName", description as "vDescription", active as "vStatus", extrnl_sys_nm as "vESN" FROM ${schemaName}.vendor v WHERE v.vend_id = $1`;
    const query2 = `SELECT vc.contact_nm as "name", vc.emailid as "email", vc.vend_contact_id as "vCId" FROM ${schemaName}.vendor_contact vc where vc.vend_id = $1 AND vc.act_flg=1`;

    const vendor = await DB.executeQuery(query, [id]);
    const contact = await DB.executeQuery(query2, [id]);

    if (vendor.rows[0]) {
      return apiResponse.successResponseWithData(res, "Operation success", {
        vendor: vendor.rows[0],
        contacts: contact.rows,
      });
    } else {
      return apiResponse.ErrorResponse(res, "No Data found");
    }
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :getVendorById");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getENSList = async (req, res) => {
  try {
    Logger.info({ message: "getENSList" });
    const selectQuery = `select lov_nm from ${schemaName}.cdas_core_lov ccl where act_flg = 1`;
    const list = await DB.executeQuery(selectQuery);
    const formatted = list.rows.map((e) => e.lov_nm);
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      formatted || []
    );
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :getENSList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.createVendor = async (req, res) => {
  try {
    const {
      vName,
      vNStd,
      vDescription,
      vStatus,
      vESN,
      vContacts,
      userId,
      userName,
      Vendor_Name_Stnd__c,
      Active_Flag__c,
      External_System_Name__c,
      Description,
      insrt_tm,
    } = req.body;

    Logger.info({ message: "createVendor" });

    const insertQuery = `INSERT INTO ${schemaName}.vendor
    (vend_nm, vend_nm_stnd, description, active, extrnl_sys_nm, insrt_tm, updt_tm, created_by, updated_by)
    VALUES($1, $2, $3, $4, $5, $7, $7, $6, $6)`;

    const idQuery = `SELECT vend_id FROM cdascfg.vendor v ORDER BY insrt_tm DESC LIMIT 1`;

    const inset = await DB.executeQuery(insertQuery, [
      vName || Vendor_Name_Stnd__c,
      vNStd || Vendor_Name_Stnd__c || vName,
      vDescription || Description,
      vStatus || helpers.stringToBoolean(Active_Flag__c) ? 1 : 0,
      vESN || External_System_Name__c,
      userId || null,
      insrt_tm,
    ]);

    const getId = await DB.executeQuery(idQuery);

    const vId = getId.rows[0].vend_id;

    if (vContacts?.length > 0) {
      await vContacts.map((e) => {
        DB.executeQuery(contactInsert, [
          vId,
          e.name,
          e.email,
          userName,
          insrt_tm,
        ]);
      });
    }

    return apiResponse.successResponse(res, "Vendor created successfully");
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :createVendor");
    Logger.error(err);
    if (err.code === "23505") {
      return apiResponse.validationErrorWithData(
        res,
        "Operation failed",
        "vendor name and external system name combination already exists."
      );
    }
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { vId, vCId, userName, userId, updt_tm } = req.body;
    Logger.info({ message: "deleteVendor" });
    const deleteQuery = `UPDATE ${schemaName}.vendor_contact SET act_flg=$2, updated_by=$3, updated_on=$4 WHERE vend_contact_id=$1`;
    await DB.executeQuery(deleteQuery, [vCId, 0, userName, updt_tm]);
    // await DB.executeQuery(logQuery, [
    //   "vendor_contact",
    //   vCId,
    //   "act_flg",
    //   1,
    //   0,
    //   userId,
    //   curDate,
    // ]);
    return apiResponse.successResponse(res, "Contact Deleted success");
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :deleteVendor");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.activeStatusUpdate = async (req, res) => {
  try {
    const { vId, vStatus, userId, updt_tm } = req.body;
    const oldValue = vStatus === 1 ? 0 : 1;
    Logger.info({ message: "activeStatusUpdate" });
    const $q1 = `select distinct vend_id from ${schemaName}.dataflow d`;
    const $query = `UPDATE ${schemaName}.vendor SET active=$1, updt_tm=$2, updated_by=$3 WHERE vend_id=$4`;

    const q1 = await DB.executeQuery($q1);
    const existingInDF = q1.rows.map((e) => parseInt(e.vend_id));
    if (existingInDF.includes(parseInt(vId))) {
      return apiResponse.validationErrorWithData(
        res,
        "Operation failed",
        "Vendor cannot be updated until removed from other dataflows using this Vendor."
      );
    } else {
      const details = await DB.executeQuery($query, [
        vStatus,
        updt_tm,
        userId,
        vId,
      ]);

      await DB.executeQuery(logQuery, [
        "vendor",
        vId,
        "active",
        oldValue,
        vStatus,
        "User Requested",
        userId,
        updt_tm,
      ]);

      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        details.row || null
      );
    }
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :activeStatusUpdate");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const {
      vId,
      vName,
      vNStd,
      vDescription,
      vStatus,
      vESN,
      vContacts,
      userId,
      userName,
      updt_tm,
    } = req.body;

    Logger.info({ message: "updateVendor" });

    const $q1 = `select distinct vend_id from ${schemaName}.dataflow d`;
    const updateQuery = `UPDATE ${schemaName}.vendor SET vend_nm=$1, vend_nm_stnd=$2, description=$3, active=$4, extrnl_sys_nm=$5, updt_tm=$6, updated_by=$7 WHERE vend_id=$8`;
    const contactUpdate = `UPDATE ${schemaName}.vendor_contact SET contact_nm=$2, emailid=$3, updated_by=$4, updated_on=$5, act_flg=$6 WHERE vend_contact_id=$1`;

    // const deleteQuery = `delete from ${schemaName}.vendor_contact vc where vend_id=$1 and act_flg <> 0`;
    const curVendor = await getCurrentVendor(vId);

    const q1 = await DB.executeQuery($q1);
    const existingInDF = q1.rows.map((e) => parseInt(e.vend_id));
    if (existingInDF.includes(parseInt(vId))) {
      return apiResponse.validationErrorWithData(
        res,
        "Operation failed",
        "Vendor cannot be updated until removed from other dataflows using this Vendor."
      );
    } else {
      const { vend_nm, vend_nm_stnd, active, extrnl_sys_nm, description } =
        curVendor;

      await DB.executeQuery(updateQuery, [
        vName,
        vNStd,
        vDescription,
        vStatus,
        vESN,
        updt_tm,
        userId,
        vId,
      ]);

      // await DB.executeQuery(deleteQuery, [vId]);

      if (vContacts.length > 0) {
        vContacts.map((e) => {
          if (e.isNew) {
            DB.executeQuery(contactInsert, [
              vId,
              e.name,
              e.email,
              userName,
              updt_tm,
            ]);
          } else {
            DB.executeQuery(contactUpdate, [
              e.vCId,
              e.name,
              e.email,
              userName,
              updt_tm,
              1,
            ]);
          }
        });
      }

      if (vend_nm != vName) {
        await DB.executeQuery(logQuery, [
          "vendor",
          vId,
          "vend_nm",
          vend_nm,
          vName,
          "User Requested",
          userId,
          updt_tm,
        ]);
      }
      if (vend_nm_stnd != vNStd) {
        await DB.executeQuery(logQuery, [
          "vendor",
          vId,
          "vend_nm_stnd",
          vend_nm_stnd,
          vNStd,
          "User Requested",
          userId,
          updt_tm,
        ]);
      }
      if (extrnl_sys_nm != vESN) {
        await DB.executeQuery(logQuery, [
          "vendor",
          vId,
          "extrnl_sys_nm",
          extrnl_sys_nm,
          vESN,
          "User Requested",
          userId,
          updt_tm,
        ]);
      }
      if (description != vDescription) {
        await DB.executeQuery(logQuery, [
          "vendor",
          vId,
          "description",
          description,
          vDescription,
          "User Requested",
          userId,
          updt_tm,
        ]);
      }
      if (active != vStatus) {
        await DB.executeQuery(logQuery, [
          "vendor",
          vId,
          "active",
          active,
          vStatus,
          "User Requested",
          userId,
          updt_tm,
        ]);
      }

      return apiResponse.successResponse(
        res,
        "Vendor details updated successfully"
      );
    }
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :updateVendor");
    Logger.error(err);
    if (err.code === "23505") {
      return apiResponse.validationErrorWithData(
        res,
        "Operation failed",
        "vendor name and external system name combination already exists."
      );
    }
    return apiResponse.ErrorResponse(res, err);
  }
};
