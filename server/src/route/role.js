const express = require("express");
const RoleController = require("../controller/RoleController");

const router = express.Router();
router.post("/create", RoleController.createRole);
router.get("/", RoleController.listRoles);

module.exports = router;
