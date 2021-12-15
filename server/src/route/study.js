var express = require("express");
const StudyController = require("../controller/StudyController");

var router = express.Router();

router.get("/search-study/:query", StudyController.studyList);

module.exports = router;