const express = require("express");
const RoleController = require("../controller/RoleController");

const router = express.Router();
router.post("/create", RoleController.createRole);

module.exports = router;
