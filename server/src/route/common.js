const express = require("express");
const RoleController = require("../controller/RoleController");

var router = express.Router();

router.get("/sdk-users", StudyController.onboardStudy);

module.exports = router;