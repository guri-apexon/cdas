const express = require("express");
const RoleController = require("../controller/RoleController");

const router = express.Router();
router.post("/create", RoleController.createRole);
router.get("/", RoleController.listRoles);
router.post("/update/status", RoleController.updateStatus);

module.exports = router;
