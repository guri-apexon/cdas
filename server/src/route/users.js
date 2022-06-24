const express = require("express");
const UserController = require("../controller/UserController");

const router = express.Router();

router.get("/list", UserController.listUsers);
router.post("/get-ad-list", UserController.getADUsers);
router.post("/validate-email", UserController.isUserExists);
router.post("/invite-external-user", UserController.inviteExternalUser);
router.post("/invite-internal-user", UserController.inviteInternalUser);
router.get("/get-user-study", UserController.getUserStudy);
router.get("/get-user-study-and-roles", UserController.getUserStudyAndRoles);
// router.post("/update-user-status", UserController.updateUserStatus);
router.post("/update-status", UserController.updateUserStatus);
router.post("/update-user-assignments", UserController.updateUserAssignments);
router.post("/delete-user-assignments", UserController.deleteUserAssignments);

module.exports = router;
