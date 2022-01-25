var express = require("express");
const PolicyController = require("../controller/PolicyController");

var router = express.Router();

router.post("/create", PolicyController.createPolicy);
router.get("/permission-list", PolicyController.listPermission);

module.exports = router;
