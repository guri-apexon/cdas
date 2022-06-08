const express = require("express");
const Controller = require("../controller/AssignmentController");

const router = express.Router();
router.post("/create", Controller.assignmentCreate);
router.delete("/remove", Controller.assignmentRemove);

module.exports = router;
