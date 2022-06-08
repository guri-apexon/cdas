const express = require("express");
const UserController = require("../controller/UserController");

const router = express.Router();
router.get("/list", UserController.listUsers);
router.get("/get-user-study", UserController.getUserStudy);

module.exports = router;
