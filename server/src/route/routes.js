const db = require("../config/db");
const express = require("express");
const authController = require("../controller/authController");
const StudyController = require("../controller/StudyController");
const cron = require("node-cron");
const CommonController = require("../controller/CommonController");

const studyRoute = require("./study");
const policyRoute = require("./policy");
const verdorRoute = require("./vendor");
const roleRoute = require("./role");

const router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

router.all("/sda", authController.authHandler);

router.get("/logout", authController.logoutHandler);

router.use("/v1/api/study/", studyRoute);
router.use("/v1/api/policy/", policyRoute);
router.use("/v1/api/vendor/", verdorRoute);
router.use("/v1/api/role/", roleRoute);

const RoleController = require("../controller/RoleController");
router.get("/v1/api/study/select-roles", RoleController.getBasicList);

//fsr-connect API
router.post("/v1/api/fsr-connect", CommonController.fsrConnect);
router.get("/v1/api/get-sdk-users", CommonController.getSdkUsers);

cron.schedule("0 */58 * * * *", () => {
  StudyController.cronUpdateStatus();
  console.log("running a task every 60 minute");
});

module.exports = router;
