const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const constants = require("../config/constants");

const { DB_SCHEMA_NAME: schemaName } = constants;

exports.getVendorsList = function (req, res) {
  try {
    Logger.info({
      message: "vendorList",
    });

    let query = `SELECT v.vend_id as "vId", vend_nm as "vName", vend_nm_stnd as "vNStd",  description as "vDescription", active as "vStatus", extrnl_sys_nm as "vESN", vc.contact_nm as "vContactName" FROM ${schemaName}.vendor v
    inner join ${schemaName}.vendor_contact vc on v.vend_id = vc.vend_id WHERE vc.act_flg=1`;
    let dbQuery = DB.executeQuery(query);

    dbQuery.then((response) => {
      const vendors = response.rows || [];
      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        vendors
      );
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :vendorList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getVendorById = function (req, res) {
  try {
    const id = req.params.vendor_id;
    Logger.info({
      message: "getVendorById",
    });

    const query = `SELECT v.vend_id as "vId", vend_nm as "vName", vend_nm_stnd as "vNStd",  description as "vDescription", active as "vStatus", extrnl_sys_nm as "vESN", vc.contact_nm as "vContact" FROM ${schemaName}.vendor v 
    inner join ${schemaName}.vendor_contact vc on v.vend_id = vc.vend_id
    where vc.act_flg=1 AND vc.vend_id = $1`;

    DB.executeQuery(query, [id]).then((response) => {
      const vendorDetail = response.rows || null;
      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        vendorDetail
      );
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err);
    Logger.error("catch :getVendorById");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getESNList = async (req, res) => {
  // extrnl_sys_nm
  try {
    Logger.info({
      message: "getESNList",
    });

    let query = `SELECT DISTINCT v.extrnl_sys_nm as "vESN" FROM ${schemaName}.vendor v`;
    let dbQuery = DB.executeQuery(query);

    dbQuery.then((response) => {
      const vESN = response.rows.map((e) => {
        return { label: e.vESN, value: e.vESN };
      }) || [{ lable: "", value: "" }];
      return apiResponse.successResponseWithData(
        res,
        "Operation success",
        vESN
      );
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :getESNList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.createVendor = async (req, res) => {
  try {
    const { vName, vNStd, vDescription, vStatus, vESN, vContacts, userId } =
      req.body;

    Logger.info({
      message: "createVendor",
    });

    const curDate = new Date();

    const vId = 1112;
    // const vCId = "";
    // console.log(
    //   "data",
    //   curDate,
    //   vId,
    //   vName,
    //   vNStd,
    //   vDescription,
    //   vStatus,
    //   vESN,
    //   userId,
    //   userName
    // );

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
      DB.executeQuery(contactQuery, [
        vId,
        e.contactName,
        e.emailId,
        userName,
        curDate,
      ]);
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
    const updateQuery = `UPDATE ${schemaName}.vendor SET vend_nm=$1, vend_nm_stnd=$2, description=$3, active=$4, extrnl_sys_nm=$5, updt_tm=$6, updated_by=$7 WHERE vend_id=$8`;

    const contactQuery = `UPDATE ${schemaName}.vendor_contact SET contact_nm=$2, emailid=$3, updated_by=$4, updated_on=$5, act_flg=$6 WHERE vend_contact_id=$1`;

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
      ]);
    });

    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      contactUp
    );
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :updateVendor");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
