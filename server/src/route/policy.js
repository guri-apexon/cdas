const express = require("express");
const PolicyController = require("../controller/PolicyController");

const router = express.Router();
router.post("/list", PolicyController.getPolicyList);

module.exports = router;
