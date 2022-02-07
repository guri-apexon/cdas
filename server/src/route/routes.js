const db = require("../config/db");
const express = require("express");
const authController = require("../controller/authController");

const studyRoute = require("./study");
const policyRoute = require("./policy");
const verdorRoute = require("./vendor");

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

module.exports = router;
