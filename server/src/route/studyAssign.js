var express = require("express");
const studyAssign = require("../controller/StudyAssignController");
var router = express.Router();

router.post("/add", studyAssign.AddStudyAssign);
router.post("/update", studyAssign.updateStudyAssign);
router.post("/delete", studyAssign.deleteStudyAssign);
router.post("/list", studyAssign.listStudyAssign);

module.exports = router;
