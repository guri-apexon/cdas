const express = require("express");
const RoleController = require("../controller/UserController");

const router = express.Router();
router.post("/create", RoleController.createNewUser);

module.exports = router;
