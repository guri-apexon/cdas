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

  protocols.forEach((p) => (p.isValid = false));
  const vpr = await assignmentHelper.validateProtocolsRoles(user, protocols);
  if (!vpr.success) return apiResponse.ErrorResponse(res, vpr.message);

  if (protocols.every((p) => !p.isValid))
    return apiResponse.ErrorResponse(
      res,
      "No valid protocols found to be processed"
    );

  if (!user.isExternal) {
    const grantResult = await assignmentHelper.protocolsStudyGrant(
      protocols,
      user,
      createdBy,
      createdOn
    );
    if (!grantResult)
      return apiResponse.ErrorResponse(
        res,
        "An error occured while ganting study in the FSR"
      );
  }

  // save it to the database
  const saveResult = await assignmentHelper.saveAssignments(
    protocols,
    user,
    createdBy,
    createdOn
  );

  if (!saveResult.success)
    return apiResponse.ErrorResponse(
      res,
      "An error occured while inserting records"
    );

  if (
    saveResult.protocolsInserted === 0 &&
    saveResult.studyRolesUserInserted === 0
  )
    return apiResponse.ErrorResponse(
      res,
      "All Protocols/Roles already existed"
    );
      if (!result) {
        return apiResponse.successResponse(
          res,
          "An unknown error encountered while saving."
        );
      }
      return apiResponse.successResponse(res, `An invitation has been emailed to ${email}`);
};

exports.assignmentRemove = async (req, res) => {
  const data = req.body;
  const { email, protocols, updatedBy, updatedOn, tenant } = data;

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

  // validate updatedBy
  const updatedById = await userHelper.findByUserId(updatedBy);
  if (updatedBy && !updatedById)
    return apiResponse.ErrorResponse(res, "Created by Id does not exists");

  protocols.forEach((p) => (p.isValid = false));
  const vpr = await assignmentHelper.validateProtocolsRoles(user, protocols);
  if (!vpr.success) return apiResponse.ErrorResponse(res, vpr.message);

  if (protocols.every((p) => !p.isValid))
    return apiResponse.ErrorResponse(
      res,
      "No valid protocols found to be processed"
    );

  if (!user.isExternal) {
    let revokeResult = await assignmentHelper.protocolsStudyRevoke(
      protocols,
      user,
      updatedBy,
      updatedOn
    );
    if (!revokeResult)
      return apiResponse.ErrorResponse(
        res,
        "An error occured while revoking study from FSR"
      );
  }

  // update database and insert logs
  const assignmentResult = await assignmentHelper.makeAssignmentsInactive(
    protocols,
    user,
    updatedBy,
    updatedOn
  );
  if (!assignmentResult)
    return apiResponse.ErrorResponse(
      res,
      "Assignment not found / already inactive"
    );

  return apiResponse.successResponse(res, "Assignments removed successfully");
};
