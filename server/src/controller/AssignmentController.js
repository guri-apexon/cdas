const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const assignmentHelper = require("../helpers/assignementHelper");
const studyHelper = require("../helpers/studyHelper");
const roleHelper = require("../helpers/roleHelper");
const userHelper = require("../helpers/userHelper");
const tenantHelper = require("../helpers/tenantHelper");
const Logger = require("../config/logger");
const moment = require("moment");
const constants = require("../config/constants");
const { create } = require("lodash");
const { getCurrentTime } = require("../helpers/customFunctions");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.assignmentCreate = async (req, res) => {
  const data = req.body;
  const { email, protocols, createdBy, createdOn, tenant } = data;

  Logger.info({ message: "create user - begin" });

  // validate data
  const validate = await assignmentHelper.validateAssignment(data);
  if (validate.success === false)
    return apiResponse.ErrorResponse(res, validate.message);

  // validate tenant
  const tenant_id = await tenantHelper.isTenantExists(tenant);
  if (!tenant_id)
    return apiResponse.ErrorResponse(res, "Tenant does not exists");

  const user = await userHelper.isUserExists(email);
  if (!user) return apiResponse.ErrorResponse(res, "User does not exists");

  if (user.usr_stat === "INACTIVE")
    return apiResponse.ErrorResponse(res, "No active or invited user found");

  let roleNotPresent = [];
  let roleNotActive = [];
  let protocolNotPresent = [];

  //  await protocols.forEach(async (protocol) => {
  for (let i = 0; i < protocols.length; i++) {
    let protocol = protocols[i];
    const study = await studyHelper.isProtocolExists(protocol.protocolname);
    if (!study) {
      protocolNotPresent.push(protocol.protocolname);
    } else {
      protocol.id = study.prot_id;
      protocol.roleIds = [];
      protocol.skipGrant =
        study.prot_nbr_stnd === "ALLSTUDY" ||
        study.prot_nbr_stnd === "NOSTUDY" ||
        user.usr_typ == "external";
      for (let j = 0; j < protocol.roles.length; j++) {
        const role_name = protocol.roles[j];
        const role = await roleHelper.isRoleExists(role_name);
        if (!role) {
          roleNotPresent.push(role_name);
        } else if (role.role_stat != 1) {
          roleNotActive.push(role_name);
        } else {
          protocol.roleIds.push(role.role_id);
        }
      }
    }
  }

  // create an error message
  let message = "";
  if (protocolNotPresent.length > 0)
    message += `Protocol(s) [${protocolNotPresent
      .map((a) => `'${a}'`)
      .join(", ")}] not found. `;
  if (roleNotPresent.length > 0)
    message += `Role(s) [${roleNotPresent
      .map((a) => `'${a}'`)
      .join(", ")}] not found. `;
  if (roleNotActive.length > 0)
    message += `Role(s) [${roleNotActive
      .map((a) => `'${a}'`)
      .join(", ")}] found inactive. `;

  if (message !== "") return apiResponse.ErrorResponse(res, message);

  // run study grant to each protocol
  for (let i = 0; i < protocols.length; i++) {
    const protocol = protocols[i];
    if (protocol.skipGrant) continue;
    try {
      const result = await studyHelper.studyGrant(
        protocol.id,
        user.usr_id,
        createdBy,
        createdOn
      );
      if (!result) {
        return apiResponse.ErrorResponse(
          res,
          "An error occured while granting study in FSR"
        );
      }
    } catch (error) {
      return apiResponse.ErrorResponse(
        res,
        "An error occured while granting study in FSR"
      );
    }
  }

  // save it to the database
  for (let i = 0; i < protocols.length; i++) {
    const protocol = protocols[i];
    if (!protocol.roleIds) continue;
    for (let j = 0; j < protocol.roleIds.length; j++) {
      const roleId = protocol.roleIds[j];
      const result = await assignmentHelper.insertUserStudyRole(
        user.usr_id,
        protocol.id,
        roleId,
        createdBy || "",
        createdOn || getCurrentTime()
      );

      if (!result) {
        return apiResponse.successResponse(
          res,
          "An unknown error encountered while saving."
        );
      }
    }
  }
  return apiResponse.successResponse(res, "Assignments created successfully");
};
