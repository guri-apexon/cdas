const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const _ = require("lodash");
const helper = require("../helpers/customFunction");
const constants = require("../config/constants");

const { DB_SCHEMA_NAME: schemaName } = constants;

exports.getVendorsList = async (req, res) => {
  try {
    Logger.info({
      message: "vendorList",
    });

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
    // console.log(id);

    const query = `SELECT v.vend_id as "vId", vend_nm as "vName", description as "vDescription", active as "vStatus", extrnl_sys_nm as "vESN" FROM ${schemaName}.vendor v WHERE v.vend_id = $1`;
    const query2 = `SELECT vc.contact_nm as "name", vc.emailid as "email", vc.vend_contact_id as "vCId" FROM ${schemaName}.vendor_contact vc where vc.vend_id = $1`;

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

exports.activeStatusUpdate = async (req, res) => {
  try {
    const { vId, vStatus, userId } = req.body;
    const curDate = new Date();
    Logger.info({
      message: "activeStatusUpdate",
    });

    const $q1 = `select distinct vend_id from ${schemaName}.dataflow d`;
    const $query = `UPDATE ${schemaName}.vendor SET active=$1, updt_tm=$2, updated_by=$3 WHERE vend_id=$4`;

    const q1 = await DB.executeQuery($q1);
    const existingInDF = q1.rows.map((e) => parseInt(e.vend_id));
    // console.log(existingInDF.includes(vId), existingInDF, vId);
    if (existingInDF.includes(parseInt(vId))) {
      return apiResponse.validationErrorWithData(
        res,
        "Operation failed",
        "Vendor cannot be inactivated until removed from all data flows using this Vendor."
      );
    } else {
      const details = await DB.executeQuery($query, [
        vStatus,
        curDate,
        userId,
        vId,
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

// exports.getESNList = async (req, res) => {
//   // extrnl_sys_nm
//   try {
//     Logger.info({
//       message: "getESNList",
//     });

//     let query = `SELECT DISTINCT v.extrnl_sys_nm as "vESN" FROM ${schemaName}.vendor v`;
//     let dbQuery = DB.executeQuery(query);

//     dbQuery.then((response) => {
//       const vESN = response.rows.map((e) => {
//         return { label: e.vESN, value: e.vESN };
//       }) || [{ lable: "", value: "" }];
//       return apiResponse.successResponseWithData(
//         res,
//         "Operation success",
//         vESN
//       );
//     });
//   } catch (err) {
//     //throw error in json response with status 500.
//     Logger.error("catch :getESNList");
//     Logger.error(err);

//     return apiResponse.ErrorResponse(res, err);
//   }
// };

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
    } = req.body;

    Logger.info({
      message: "createVendor",
    });

    const curDate = new Date();

    // const vId = helper.generateUniqueID();

    const insertQuery = `INSERT INTO ${schemaName}.vendor
    (vend_id, vend_nm, vend_nm_stnd, description, active, extrnl_sys_nm, insrt_tm, updt_tm, created_by, updated_by)
    VALUES($2, $3, $4, $5, $6, $7, $1, $1, $8, $8)`;

    const contactQuery = `INSERT INTO ${schemaName}.vendor_contact
    (vend_id, contact_nm, emailid, created_by, created_on, updated_by, updated_on, act_flg)
    VALUES($1, $2, $3, $4, $5, $4, $5, 1)`;

    const inset = await DB.executeQuery(insertQuery, [
      curDate,
      vId,
      vName,
      vNStd,
      vDescription,
      vStatus,
      vESN,
      userId,
    ]);

    const contactInset = await vContacts.map((e) => {
      DB.executeQuery(contactQuery, [vId, e.name, e.email, userName, curDate]);
    });

    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      contactInset
    );
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :createVendor");
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
    } = req.body;

    Logger.info({
      message: "updateVendor",
    });

    const curDate = new Date();
    const $q1 = `select distinct vend_id from ${schemaName}.dataflow d`;
    const updateQuery = `UPDATE ${schemaName}.vendor SET vend_nm=$1, vend_nm_stnd=$2, description=$3, active=$4, extrnl_sys_nm=$5, updt_tm=$6, updated_by=$7 WHERE vend_id=$8`;
    const contactQuery = `UPDATE ${schemaName}.vendor_contact SET contact_nm=$2, emailid=$3, updated_by=$4, updated_on=$5, act_flg=$6 WHERE vend_contact_id=$1 AND vend_id=$7`;
    const q1 = await DB.executeQuery($q1);
    const existingInDF = q1.rows.map((e) => parseInt(e.vend_id));
    // console.log(existingInDF.includes(vId), existingInDF, vId);
    if (existingInDF.includes(parseInt(vId))) {
      return apiResponse.validationErrorWithData(
        res,
        "Operation failed",
        "Vendor cannot be inactivated until removed from all data flows using this Vendor."
      );
    } else {
      const update = await DB.executeQuery(updateQuery, [
        vName,
        vNStd,
        vDescription,
        vStatus,
        vESN,
        curDate,
        userId,
        vId,
      ]);

      const contactUp = await vContacts.map((e) => {
        DB.executeQuery(contactQuery, [
          e.vCId,
          e.contactName,
          e.emailId,
          userName,
          curDate,
          e.status,
          vId,
        ]);
      });

      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        contactUp
      );
    }
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :updateVendor");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
