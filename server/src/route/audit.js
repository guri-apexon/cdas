const express = require("express");
const AuditController = require("../controller/AuditController");

var router = express.Router();

router.post("/create", AuditController.create);

module.exports = router;
