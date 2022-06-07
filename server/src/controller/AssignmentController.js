const apiResponse = require("../helpers/apiResponse");
const assignmentHelper = require("../helpers/assignementHelper");
const userHelper = require("../helpers/userHelper");
const tenantHelper = require("../helpers/tenantHelper");
const Logger = require("../config/logger");
const moment = require("moment");
const constants = require("../config/constants");
const { create } = require("lodash");

exports.assignmentCreate = async (req, res) => {
  const data = req.body;
  const { email, protocols, createdBy, createdOn, tenant } = data;

  // validate data
  const validate = await assignmentHelper.validateAssignment(data);
  if (validate.success === false)
    return apiResponse.ErrorResponse(res, validate.message);

  // validate tenant
  const tenant_id = await tenantHelper.findByName(tenant);
  if (!tenant_id)
    return apiResponse.ErrorResponse(res, "Tenant does not exists");

  // validate user
  const user = await userHelper.findByEmail(email);
  if (!user) return apiResponse.ErrorResponse(res, "User does not exists");
  if (user.isInactive)
    return apiResponse.ErrorResponse(res, "No active or invited user found");

  // validate createdby
  const createdById = await userHelper.findByUserId(createdBy);
  if (createdBy && !createdById)
    return apiResponse.ErrorResponse(res, "Created by Id does not exists");

  const vpr = await assignmentHelper.validateProtocolsRoles(user, protocols);
  if (!vpr.success) apiResponse.ErrorResponse(res, vpr.message);

  if (protocols.every((p) => !p.isValid))
    apiResponse.ErrorResponse(res, "No valid protocols found to be processed");

  if (!user.isExternal)
    await assignmentHelper.protocolsStudyGrant(
      protocols,
      user,
      createdBy,
      createdOn
    );

  // save it to the database
  await assignmentHelper.saveAssignments(protocols, user, createdBy, createdOn);

  return apiResponse.successResponse(res, "Assignments created successfully");
};

exports.assignmentRemove = async (req, res) => {
  const data = req.body;
  const { email, protocols, createdBy, createdOn, tenant } = data;

  // validate data
  const validate = await assignmentHelper.validateAssignment(data);
  if (validate.success === false)
    return apiResponse.ErrorResponse(res, validate.message);

  // validate tenant
  const tenant_id = await tenantHelper.findByName(tenant);
  if (!tenant_id)
    return apiResponse.ErrorResponse(res, "Tenant does not exists");

  // validate user
  const user = await userHelper.findByEmail(email);
  if (!user) return apiResponse.ErrorResponse(res, "User does not exists");
  if (user.isInactive)
    return apiResponse.ErrorResponse(res, "No active or invited user found");

  // validate createdby
  const createdById = await userHelper.findByUserId(createdBy);
  if (createdBy && !createdById)
    return apiResponse.ErrorResponse(res, "Created by Id does not exists");

  const vpr = await assignmentHelper.validateProtocolsRoles(user, protocols);
  if (!vpr.success) apiResponse.ErrorResponse(res, vpr.message);

  if (protocols.every((p) => !p.isValid))
    apiResponse.ErrorResponse(res, "No valid protocols found to be processed");

  if (!user.isExternal)
    await assignmentHelper.protocolsStudyRevoke(
      protocols,
      user,
      createdBy,
      createdOn
    );

  // update database and insert logs
  await assignmentHelper.makeAssignmentsInactive(
    protocols,
    user,
    createdBy,
    createdOn
  );

  return apiResponse.successResponse(res, "Assignments created successfully");
};
