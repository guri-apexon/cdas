const express = require("express");
const UserController = require("../controller/UserController");

const router = express.Router();

router.get("/list", UserController.listUsers);
router.post("/validate-email", UserController.isUserExists);
router.post("/add", UserController.addNewUser);
router.get("/get-user-study", UserController.getUserStudy);

module.exports = router;
