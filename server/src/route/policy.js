const express = require("express");
const PolicyController = require("../controller/PolicyController");

const router = express.Router();
router.post("/create", PolicyController.createPolicy);
router.post("/update", PolicyController.updatePolicy);
router.get("/permission-list/:policyId?", PolicyController.listPermission);
router.post("/list", PolicyController.getPolicyList);
router.get("/products", PolicyController.getProducts);

module.exports = router;
