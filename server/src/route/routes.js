const db = require("../config/db");
const express = require("express");
const auth = require("../controller/auth");

const router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);


router.all("/sda", auth.authHandler);

module.exports = router;