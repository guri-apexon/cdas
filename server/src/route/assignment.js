const express = require("express");
const Controller = require("../controller/AssignmentController");

const router = express.Router();
router.post("/create", Controller.assignmentCreate);

module.exports = router;
