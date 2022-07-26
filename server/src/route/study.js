var express = require("express");
const StudyController = require("../controller/StudyController");

var router = express.Router();

router.get("/search-study/:query", StudyController.studyList);
router.get("/search-study", StudyController.studyList);
router.post("/list", StudyController.getStudyList);
router.post("/onboard", StudyController.onboardStudy);
router.get("/notonboarded-studies-stat", StudyController.noOnboardedStat);

router.post("/assign/add", StudyController.AddStudyAssign);
router.post("/assign/update", StudyController.updateStudyAssign);
router.post("/assign/delete", StudyController.deleteStudyAssign);
router.post("/assign/list", StudyController.listStudyAssign);

module.exports = router;
