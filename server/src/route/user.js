const express = require("express");
const UserController = require("../controller/UserController");

const router = express.Router();
router.post("/create", UserController.createNewUser);
router.delete("/deleteuser", UserController.deleteNewUser);

module.exports = router;
