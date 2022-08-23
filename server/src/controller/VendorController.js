const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const _ = require("lodash");
const constants = require("../config/constants");
const helpers = require("../helpers/customFunctions");

const { DB_SCHEMA_NAME: schemaName } = constants;

const contactInsert = `INSERT INTO ${schemaName}.vendor_contact (vend_id, contact_nm, emailid, created_by, created_on, updated_by, updated_on, act_flg) VALUES($1, $2, $3, $4, $5, $4, $5, 1)`;
const logQuery = `INSERT INTO ${schemaName}.audit_log (tbl_nm, id, "attribute", old_val, new_val, rsn_for_chg, updated_by, updated_on) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;

exports.getVendorsList = async (req, res) => {
  try {
    let extrnl_sys_nm = req.query.extrnl_sys_nm || null;
    let filter = "";
    if (extrnl_sys_nm) {
      filter = ` where v.extrnl_sys_nm = '${extrnl_sys_nm}'`;
    }
    Logger.info({ message: "vendorList" });

    let query = `select v.vend_id as "vId", vend_nm as "vName", vend_nm_stnd as "vNStd", v.extrnl_id as "ExternalId", description as "vDescription", active as "status", extrnl_sys_nm as "vESN", vc.Ven_Contact_nm as "vContactName" from ${schemaName}.vendor v 
    left join (select vc.vend_id , string_agg(vc.contact_nm,', ') as Ven_Contact_nm from ${schemaName}.vendor_contact vc where act_flg =1 group by vc.vend_id) vc  on v.vend_id =vc.vend_id ${filter}`;

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
    const id = req.params.vendor_id;
    Logger.info({ message: "getVendorById" });

    const query = `SELECT v.vend_id as "vId", vend_nm as "vName", description as "vDescription", active as "vStatus", extrnl_sys_nm as "vESName" FROM ${schemaName}.vendor v WHERE v.vend_id = $1`;
    const query2 = `SELECT vc.contact_nm as "name", vc.emailid as "email", vc.vend_contact_id as "vCId" FROM ${schemaName}.vendor_contact vc where vc.vend_id = $1 AND vc.act_flg=1`;

    const vendor = await DB.executeQuery(query, [id]);
    const contact = await DB.executeQuery(query2, [id]);

    if (vendor.rows[0]) {
      return apiResponse.successResponseWithData(res, "Operation success", {
        vendor: vendor.rows[0],
        contacts: contact.rows,
      });
    } else {
      return apiResponse.ErrorResponse(res, "No data found");
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

// exports.createVendor = async (req, res) => {
//   try {
//     const {
//       vName,
//       vNStd,
//       vDescription,
//       vStatus,
//       vESN,
//       vContacts,
//       userId,
//       userName,
//       Vendor_Name_Stnd__c,
//       Active_Flag__c,
//       External_System_Name__c,
//       Description,
//       insrt_tm,
//     } = req.body;

//     Logger.info({ message: "createVendor" });

//     const insertQuery = `INSERT INTO ${schemaName}.vendor
//     (vend_nm, vend_nm_stnd, description, active, extrnl_sys_nm, insrt_tm, updt_tm, created_by, updated_by)
//     VALUES($1, $2, $3, $4, $5, $7, $7, $6, $6) `;

//     const idQuery = `SELECT vend_id FROM cdascfg.vendor v ORDER BY insrt_tm DESC LIMIT 1`;

//     const inset = await DB.executeQuery(insertQuery, [
//       vName || Vendor_Name_Stnd__c,
//       vNStd || Vendor_Name_Stnd__c || vName,
//       vDescription || Description,
//       vStatus || helpers.stringToBoolean(Active_Flag__c) ? 1 : 0,
//       vESN || External_System_Name__c,
//       userId || null,
//       insrt_tm,
//     ]);

//     const getId = await DB.executeQuery(idQuery);

//     const vId = getId.rows[0].vend_id;

//     if (vContacts?.length > 0) {
//       await vContacts.map((e) => {
//         DB.executeQuery(contactInsert, [
//           vId,
//           e.name,
//           e.email,
//           userName,
//           insrt_tm,
//         ]);
//       });
//     }

//     return apiResponse.successResponse(res, "Vendor created successfully");
//   } catch (err) {
//     //throw error in json response with status 500.
//     Logger.error("catch :createVendor");
//     Logger.error(err);
//     if (err.code === "23505") {
//       return apiResponse.validationErrorWithData(
//         res,
//         "Operation failed",
//         "vendor name and external system name combination already exists."
//       );
//     }
//     return apiResponse.ErrorResponse(res, err);
//   }
// };

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
    return apiResponse.successResponse(res, "Contact deleted success");
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
    console.log("vId", vId);
    const oldValue = vStatus === 1 ? 0 : 1;
    Logger.info({ message: "activeStatusUpdate" });

    const $q1 = `select count(1) from ${schemaName}.dataflow d where vend_id=$1`;

    const $query = `UPDATE ${schemaName}.vendor SET active=$1, updt_tm=$2, updated_by=$3 WHERE vend_id=$4 RETURNING *`;

    const {
      rows: [DataFlowCountForVendor],
    } = await DB.executeQuery($q1, [vId]);

    if (DataFlowCountForVendor.count != 0) {
      return apiResponse.validationErrorWithData(
        res,
        "Operation failed",
        "Vendor cannot be inactivated until removed from other dataflows using this vendor."
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
        details.rows || null
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

const mandatoryMissing = `Please check payload mandatory fields are missing`;
const vSaveSuccess = `Vendor was saved successfully`;
const vUpdateSuccess = `Vendor was updated successfully`;
const vendorExist = `Vendor name and external system name combination already exists`;

exports.createVendor = async (req, res) => {
  try {
    Logger.info({ message: "createVendor" });

    const {
      ExternalId,
      systemName,
      vId: ID,
      vName,
      vDescription,
      vStatus,
      vESName,
      vContacts,
      vMnemonic,
      userId,
      insrt_tm,
    } = req.body;

    if (vMnemonic) {
      if (typeof vMnemonic !== "string") {
        return apiResponse.validationErrorWithData(
          "vMnemonic fields optional and data type should be string."
        );
      }
    }

    const curDate = helpers.getCurrentTime();

    const insertQuery = `INSERT INTO ${schemaName}.vendor (vend_nm, vend_nm_stnd, description, active, extrnl_sys_nm, insrt_tm, updt_tm ,  created_by, updated_by , extrnl_id) VALUES($1, $2, $3, $4, $5, $6, $6, $7, $7, $8) RETURNING *`;
    const dfVendorList = `select count(1) from ${schemaName}.dataflow d where vend_id=$1`;
    let updateQuery = `UPDATE ${schemaName}.vendor SET vend_nm=$1, description=$2, active=$3, extrnl_sys_nm=$4, updt_tm=$5, updated_by=$6`;
    const contactUpdate = `UPDATE ${schemaName}.vendor_contact SET contact_nm=$1, emailid=$2, updated_by=$3, updated_on=$4, act_flg=1 WHERE vend_contact_id=$5 AND vend_id=$6 RETURNING *`;
    const selectVendor = `SELECT vend_nm, vend_nm_stnd, description, active, extrnl_sys_nm, vend_id FROM ${schemaName}.vendor where vend_id = $1`;
    const selectExVendor = `SELECT vend_nm, vend_nm_stnd, description, active, extrnl_sys_nm, vend_id FROM ${schemaName}.vendor where extrnl_id = $1`;
    const executedDataFlowCountForVendor = `select count(1) from ${schemaName}.dataflow where data_in_cdr = 'Y' and vend_id =$1`;

    if (!vName || !vESName || !userId || typeof vStatus !== "number") {
      return apiResponse.validationErrorWithData(
        res,
        "Operation failed",
        mandatoryMissing
      );
    }

    let existingVendor = "";

    if (ExternalId) {
      existingVendor = await DB.executeQuery(selectExVendor, [ExternalId]);
    }

    if (ID) {
      existingVendor = await DB.executeQuery(selectVendor, [ID]);
    }

    let vNameStd;
    if (vMnemonic) {
      vNameStd = vMnemonic;
    } else {
      if (vName) {
        const vNameStr = vName.replace(/[^a-zA-Z0-9]/g, "");
        vNameStd = vNameStr.toUpperCase();
      }
    }

    const payload = [
      vName,
      vNameStd,
      vDescription,
      vStatus,
      vESName,
      curDate,
      userId,
    ];

    const UpdatePayload = [
      vName,
      vDescription,
      vStatus,
      vESName,
      curDate,
      userId,
    ];

    let updatedID = "";

    if (existingVendor?.rows) {
      updatedID = existingVendor?.rows[0]?.vend_id;
    }

    if (!updatedID) {
      const inset = await DB.executeQuery(insertQuery, [
        ...payload,
        ExternalId || null,
      ]);

      const vId = inset?.rows[0].vend_id;
      if (vContacts?.length > 0) {
        await vContacts.map((e) => {
          DB.executeQuery(contactInsert, [
            vId,
            e.name,
            e.email,
            userId,
            insrt_tm,
          ]);
        });
      }
      if (systemName === "CDI") {
        return apiResponse.successResponse(res, vSaveSuccess);
      } else {
        return apiResponse.successResponseWithMoreData(res, {
          ExternalId,
          id: inset?.rows[0].vend_id,
        });
      }
    } else {
      if (!vStatus) {
        const {
          rows: [DataFlowCountForVendor],
        } = await DB.executeQuery(dfVendorList, [updatedID]);

        // if (DataFlowCountForVendor.count != 0 && !ExternalId) {
        if (DataFlowCountForVendor.count != 0) {
          return apiResponse.validationErrorWithData(
            res,
            "Operation failed",
            "Vendor cannot be inactivated until removed from other dataflows using this vendor."
          );
        }
      }

      // if (!updatedID) {
      //   return apiResponse.validationErrorWithData(
      //     res,
      //     "Operation failed",
      //     mandatoryMissing
      //   );
      // }

      const {
        rows: [runDataFlowCountForVendor],
      } = await DB.executeQuery(executedDataFlowCountForVendor, [updatedID]);

      let updatedVendor = {};

      if (runDataFlowCountForVendor.count != 0) {
        updateQuery += `WHERE vend_id=$7 RETURNING *`;
        updatedVendor = await DB.executeQuery(updateQuery, [
          ...UpdatePayload, //...payload,
          updatedID,
        ]);
      } else {
        updateQuery += `,vend_nm_stnd=$8 WHERE vend_id=$7 RETURNING *`;
        updatedVendor = await DB.executeQuery(updateQuery, [
          ...UpdatePayload, //...payload,
          updatedID,
          vNameStd,
        ]);
      }

      let updatedContacts = {};

      if (vContacts?.length) {
        for (let e of vContacts) {
          if (e.isNew) {
            console.log("new", e);
            updatedContacts = await DB.executeQuery(contactInsert, [
              updatedID,
              e.name,
              e.email,
              userId,
              insrt_tm,
            ]);
          } else {
            updatedContacts = await DB.executeQuery(contactUpdate, [
              e.name,
              e.email,
              userId,
              insrt_tm,
              e.vCId.toString(),
              updatedID,
            ]);
          }
        }
      }

      // below if condition is commended
      // if (
      //   !updatedVendor?.rowCount ||
      //   !existingVendor?.rowCount ||
      //   !updatedContacts?.rowCount
      // ) {
      //
      //   return apiResponse.ErrorResponse(res, "Something went wrong");
      // }

      const vendorObj = updatedVendor?.rows[0];
      const existingObj = existingVendor?.rows[0];

      const comparisionObj = {
        vend_nm: vendorObj.vend_nm,
        vend_nm_stnd: vendorObj.vend_nm_stnd,
        description: vendorObj.description,
        active: vendorObj.active,
        extrnl_sys_nm: vendorObj.extrnl_sys_nm,
        vend_id: vendorObj.vend_id,
      };

      const diffObj = helpers.getdiffKeys(comparisionObj, existingObj);

      Object.keys(diffObj).forEach(async (key) => {
        await DB.executeQuery(logQuery, [
          "vendor",
          updatedID,
          key,
          existingObj[key],
          diffObj[key],
          "User Requested",
          userId,
          insrt_tm,
        ]);
      });

      if (systemName === "CDI") {
        return apiResponse.successResponse(res, vUpdateSuccess);
      } else {
        return apiResponse.successResponseWithMoreData(res, {
          ExternalId,
          // message: updatedID
          //   ? "Vendor was updated successfully"
          //   : "Vendor was saved successfully",
          id: updatedID,
        });
      }
    }
    // }
  } catch (err) {
    console.log("errrrrr", err);
    //throw error in json response with status 500.
    Logger.error("catch :createVendor");
    Logger.error(err);
    if (err.code === "23505") {
      return apiResponse.validationErrorWithData(
        res,
        "Operation failed",
        vendorExist
      );
    }
    return apiResponse.ErrorResponse(res, err);
  }
};

// exports.createVendor = async (req, res) => {
//   try {
//     const {
//       vName,
//       vNStd,
//       vDescription,
//       vStatus,
//       vESN,
//       vContacts,
//       userId,
//       userName,
//       Vendor_Name_Stnd__c,
//       Active_Flag__c,
//       External_System_Name__c,
//       Description,
//     } = req.body;

//     Logger.info({ message: "createVendor" });

//     const curDate = helpers.getCurrentTime();

//     const insertQuery = `INSERT INTO ${schemaName}.vendor
//     (vend_nm, vend_nm_stnd, description, active, extrnl_sys_nm, insrt_tm, updt_tm, created_by, updated_by)
//     VALUES($1, $2, $3, $4, $5, $7, $7, $6, $6)`;

//     const idQuery = `SELECT vend_id FROM cdascfg.vendor v ORDER BY insrt_tm DESC LIMIT 1`;

//     const inset = await DB.executeQuery(insertQuery, [
//       vName || Vendor_Name_Stnd__c,
//       vNStd || Vendor_Name_Stnd__c || vName,
//       vDescription || Description,
//       vStatus || helpers.stringToBoolean(Active_Flag__c) ? 1 : 0,
//       vESN || External_System_Name__c,
//       userId || null,
//       curDate,
//     ]);

//     const getId = await DB.executeQuery(idQuery);

//     const vId = getId.rows[0].vend_id;

//     if (vContacts?.length > 0) {
//       await vContacts.map((e) => {
//         DB.executeQuery(contactInsert, [
//           vId,
//           e.name,
//           e.email,
//           userName,
//           curDate,
//         ]);
//       });
//     }

//     return apiResponse.successResponse(res, "Vendor created successfully");
//   } catch (err) {
//     //throw error in json response with status 500.
//     Logger.error("catch :createVendor");
//     Logger.error(err);
//     if (err.code === "23505") {
//       return apiResponse.validationErrorWithData(
//         res,
//         "Operation failed",
//         "Vendor name and external system name combination already exists."
//       );
//     }
//     return apiResponse.ErrorResponse(res, err);
//   }
// };

// async function getCurrentVendor(vId) {
//   const { rows } = await DB.executeQuery(
//     `SELECT * FROM ${schemaName}.vendor where vend_id = $1`,
//     [vId]
//   );
//   return rows[0];
// }

// exports.updateVendor = async (req, res) => {
//   try {
//     const {
//       vId,
//       vName,
//       vNStd,
//       vDescription,
//       vStatus,
//       vESN,
//       vContacts,
//       userId,
//       userName,
//     } = req.body;

//     Logger.info({ message: "updateVendor" });

//     const curDate = helpers.getCurrentTime();
//     const $q1 = `select distinct vend_id from ${schemaName}.dataflow d`;
//     const updateQuery = `UPDATE ${schemaName}.vendor SET vend_nm=$1, vend_nm_stnd=$2, description=$3, active=$4, extrnl_sys_nm=$5, updt_tm=$6, updated_by=$7 WHERE vend_id=$8`;
//     const contactUpdate = `UPDATE ${schemaName}.vendor_contact SET contact_nm=$2, emailid=$3, updated_by=$4, updated_on=$5, act_flg=$6 WHERE vend_contact_id=$1`;

//     // const deleteQuery = `delete from ${schemaName}.vendor_contact vc where vend_id=$1 and act_flg <> 0`;
//     const curVendor = await getCurrentVendor(vId);

//     const q1 = await DB.executeQuery($q1);
//     const existingInDF = q1.rows.map((e) => parseInt(e.vend_id));
//     if (existingInDF.includes(parseInt(vId))) {
//       return apiResponse.validationErrorWithData(
//         res,
//         "Operation failed",
//         "Vendor cannot be updated until removed from other dataflows using this vendor."
//       );
//     } else {
//       const { vend_nm, vend_nm_stnd, active, extrnl_sys_nm, description } =
//         curVendor;

//       await DB.executeQuery(updateQuery, [
//         vName,
//         vNStd,
//         vDescription,
//         vStatus,
//         vESN,
//         curDate,
//         userId,
//         vId,
//       ]);

//       // await DB.executeQuery(deleteQuery, [vId]);

//       if (vContacts.length > 0) {
//         vContacts.map((e) => {
//           if (e.isNew) {
//             DB.executeQuery(contactInsert, [
//               vId,
//               e.name,
//               e.email,
//               userName,
//               curDate,
//             ]);
//           } else {
//             DB.executeQuery(contactUpdate, [
//               e.vCId,
//               e.name,
//               e.email,
//               userName,
//               curDate,
//               1,
//             ]);
//           }
//         });
//       }

//       if (vend_nm != vName) {
//         await DB.executeQuery(logQuery, [
//           "vendor",
//           vId,
//           "vend_nm",
//           vend_nm,
//           vName,
//           "User Requested",
//           userId,
//           curDate,
//         ]);
//       }
//       if (vend_nm_stnd != vNStd) {
//         await DB.executeQuery(logQuery, [
//           "vendor",
//           vId,
//           "vend_nm_stnd",
//           vend_nm_stnd,
//           vNStd,
//           "User Requested",
//           userId,
//           curDate,
//         ]);
//       }
//       if (extrnl_sys_nm != vESN) {
//         await DB.executeQuery(logQuery, [
//           "vendor",
//           vId,
//           "extrnl_sys_nm",
//           extrnl_sys_nm,
//           vESN,
//           "User Requested",
//           userId,
//           curDate,
//         ]);
//       }
//       if (description != vDescription) {
//         await DB.executeQuery(logQuery, [
//           "vendor",
//           vId,
//           "description",
//           description,
//           vDescription,
//           "User Requested",
//           userId,
//           curDate,
//         ]);
//       }
//       if (active != vStatus) {
//         await DB.executeQuery(logQuery, [
//           "vendor",
//           vId,
//           "active",
//           active,
//           vStatus,
//           "User Requested",
//           userId,
//           curDate,
//         ]);
//       }

//       return apiResponse.successResponse(
//         res,
//         "Vendor details updated successfully"
//       );
//     }
//   } catch (err) {
//     //throw error in json response with status 500.
//     Logger.error("catch :updateVendor");
//     Logger.error(err);
//     if (err.code === "23505") {
//       return apiResponse.validationErrorWithData(
//         res,
//         "Operation failed",
//         "Vendor name and external system name combination already exists."
//       );
//     }
//     return apiResponse.ErrorResponse(res, err);
//   }
// };
