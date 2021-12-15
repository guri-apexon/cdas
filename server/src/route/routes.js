const db = require("../config/db");
const express = require("express");
const authController = require("../controller/authController");
const StudyController = require("../controller/StudyController");

const router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);


router.all("/sda", authController.authHandler);

router.get("/api/study/search-study/:query", StudyController.studyList);

router.post("/api/study/list", StudyController.getStudyList);

module.exports = router;