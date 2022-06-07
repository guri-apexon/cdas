const express = require("express");
const UserController = require("../controller/UserController");

const router = express.Router();
router.get("/list", UserController.listUsers);

module.exports = router;
