const apiResponse = require("../helpers/apiResponse");
const assignmentHelper = require("../helpers/assignementHelper");
const userHelper = require("../helpers/userHelper");
const tenantHelper = require("../helpers/tenantHelper");
const commonHelper = require("../helpers/commonHelper");
const Logger = require("../config/logger");
const moment = require("moment");
const constants = require("../config/constants");
const { create } = require("lodash");

exports.assignmentCreate = async (req, res) => {
  const data = req.body;
  const { returnBool } = req;
  const { email, protocols, createdBy, createdOn, tenant } = data;

  // validate data
  const validate = await assignmentHelper.validateAssignment(data);
  if (validate.success === false)
    return returnBool
      ? false
      : apiResponse.ErrorResponse(res, validate.message);

  // validate tenant
  const tenant_id = await tenantHelper.findByName(tenant);
  if (!tenant_id)
    return returnBool
      ? false
      : apiResponse.ErrorResponse(res, "Tenant does not exists");

  // validate user
  const user = await userHelper.findByEmail(email);
  if (!user)
    return returnBool
      ? false
      : apiResponse.ErrorResponse(res, "User does not exists");
  if (user.isInactive)
    return returnBool
      ? false
      : apiResponse.ErrorResponse(res, "No active or invited user found");

  // validate createdby
  const createdById = await userHelper.findByUserId(createdBy);
  if (createdBy && !createdById)
    return returnBool
      ? false
      : apiResponse.ErrorResponse(res, "Created by Id does not exists");

  if (createdOn && !commonHelper.isValidDate(createdOn))
    return returnBool
      ? false
      : apiResponse.ErrorResponse(res, "Created on date is not valid");

  protocols.forEach((p) => (p.isValid = false));
  const vpr = await assignmentHelper.validateProtocolsRoles(user, protocols);
  if (!vpr.success)
    return returnBool ? false : apiResponse.ErrorResponse(res, vpr.message);

  if (protocols.every((p) => !p.isValid))
    return returnBool
      ? false
      : apiResponse.ErrorResponse(
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
      return returnBool
        ? false
        : apiResponse.ErrorResponse(
            res,
            "An error occured while granting study in the FSR"
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
    return returnBool
      ? false
      : apiResponse.ErrorResponse(
          res,
          "An error occured while inserting records"
        );

  if (saveResult.changeCount === 0)
    return returnBool
      ? false
      : apiResponse.ErrorResponse(res, "All Protocols/Roles already existed");

  return returnBool
    ? false
    : apiResponse.successResponse(res, "Assignment created Successfully");
};

exports.assignmentRemove = async (req, res) => {
  const data = req.body;
  const { email, protocols, updatedBy, updatedOn, tenant } = data;

  // validate data
  const validate = await assignmentHelper.validateAssignment(data);
  if (validate.success === false)
    return apiResponse.ErrorResponse(res, validate.message);

  if (!moment(updatedOn).isValid())
    return apiResponse.ErrorResponse(res, "Updated on date is not valid");

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
    return apiResponse.ErrorResponse(res, "Updated by Id does not exists");

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

exports.assignmentUpdate = async (req, res) => {
  Logger.info({
    message: "assignmentUpdate - begin",
  });

  const { returnBool } = req;

  const data = req.body;
  const { email, protocols, removedProtocols, createdBy, createdOn, tenant } =
    data;

  // validate data
  const validate = await assignmentHelper.validateAssignment(data);
  if (validate.success === false)
    return returnBool
      ? false
      : apiResponse.ErrorResponse(res, validate.message);

  // validate user
  const user = await userHelper.findByEmail(email);

  // inactive all user study assignments
  await assignmentHelper.inactiveAllUserStudies(user.usr_id);

  await assignmentHelper.assignmentCleanUpFunction(user.usr_id);

  // // update database and insert logs
  // if (removedProtocols?.length) {
  //   const assignmentResult = await assignmentHelper.makeAssignmentsInactive(
  //     removedProtocols,
  //     user,
  //     createdBy,
  //     createdOn
  //   );
  //   if (!assignmentResult) {
  //     return returnBool
  //       ? false
  //       : apiResponse.ErrorResponse(
  //           res,
  //           "Assignment not found / already inactive"
  //         );
  //   }
  // }
  // save it to the database
  const saveResult = await assignmentHelper.updateAssignments(
    protocols,
    user,
    createdBy,
    createdOn
  );
  await assignmentHelper.assignmentCleanUpFunction(user.usr_id);
  if (!saveResult.success)
    return returnBool
      ? false
      : apiResponse.ErrorResponse(
          res,
          "An error occured while inserting records"
        );

  if (
    saveResult.protocolsInserted === 0 &&
    saveResult.studyRolesUserInserted === 0
  )
    return returnBool
      ? false
      : apiResponse.ErrorResponse(res, "All Protocols/Roles already existed");

  return returnBool
    ? true
    : apiResponse.successResponse(
        res,
        `An invitation has been emailed to ${email}`
      );
};
