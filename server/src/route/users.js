const express = require("express");
const UserController = require("../controller/UserController");

const router = express.Router();
//router.post("/create", UserController.createRole);
//router.post("/update", UserController.updateRole);
router.get("/list", UserController.listUsers);

module.exports = router;
