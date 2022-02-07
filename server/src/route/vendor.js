var express = require("express");
const VendorController = require("../controller/VendorController");

var router = express.Router();

router.post("/list", VendorController.getVendorsList);
router.post("/vesn/list", VendorController.getESNList);
router.post("/details/:vendor_id", VendorController.getVendorById);
router.post("/create", VendorController.createVendor);
router.post("/update", VendorController.updateVendor);

module.exports = router;
