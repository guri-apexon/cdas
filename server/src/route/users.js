const express = require("express");
const UserController = require("../controller/UserController");

const router = express.Router();

router.get("/list", UserController.listUsers);
router.post("/get-ad-list", UserController.getADUsers);
router.post("/validate-email", UserController.isUserExists);
router.post("/invite-external-user", UserController.inviteExternalUser);
router.get("/get-user-study", UserController.getUserStudy);

module.exports = router;
