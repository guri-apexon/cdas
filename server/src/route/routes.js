const db = require("../config/db");
const express = require("express");
const AuthController = require("../controller/AuthController");
const StudyController = require("../controller/StudyController");
const UserController = require("../controller/UserController");
const cron = require("node-cron");
const CommonController = require("../controller/CommonController");

const studyRoute = require("./study");
const policyRoute = require("./policy");
const verdorRoute = require("./vendor");
const roleRoute = require("./role");
const usersRoute = require("./users");
const userRoute = require("./user");
const assignmentRoute = require("./assignment");

const router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

router.all("/sda", AuthController.authHandler);

router.get("/logout", AuthController.logoutHandler);

router.use("/v1/api/study/", studyRoute);
router.use("/v1/api/policy/", policyRoute);
router.use("/v1/api/vendor/", verdorRoute);
router.use("/v1/api/role/", roleRoute);
router.use("/v1/api/users/", usersRoute);
router.use("/v1/api/user/", userRoute);
router.use("/v1/api/assignment/", assignmentRoute);

const RoleController = require("../controller/RoleController");
router.get("/v1/api/study/select-roles", RoleController.getBasicList);

//fsr-connect API
router.post("/v1/api/fsr-connect", CommonController.fsrConnect);
router.get("/v1/api/get-sdk-users", CommonController.getSdkUsers);

// cron.schedule("0 */58 * * * *", () => {
//   StudyController.cronUpdateStatus();
//   console.log("running a task every 60 minute");
// });

cron.schedule("0 */15 * * * *", () => {
  UserController.checkInvitedStatus();
  console.log("running Check Invited Status job task every 15 minute");
});

module.exports = router;
