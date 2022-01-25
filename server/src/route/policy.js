const express = require("express");
const PolicyController = require("../controller/PolicyController");

const router = express.Router();
router.post("/create", PolicyController.createPolicy);
router.get("/permission-list", PolicyController.listPermission);
router.post("/list", PolicyController.getPolicyList);

module.exports = router;
