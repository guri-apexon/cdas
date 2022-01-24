var express = require("express");
const PolicyController = require("../controller/PolicyController");

var router = express.Router();

router.post("/create", PolicyController.createPolicy);

module.exports = router;
