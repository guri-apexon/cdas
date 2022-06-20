var express = require("express");
const VendorController = require("../controller/VendorController");

var router = express.Router();

router.all("/list", VendorController.getVendorsList);
router.post("/statusUpdate", VendorController.activeStatusUpdate);
router.get("/details/:vendor_id", VendorController.getVendorById);
router.post("/create", VendorController.createVendor);
// router.post("/update", VendorController.updateVendor);
router.post("/contact/delete", VendorController.deleteContact);
router.get("/vens-list", VendorController.getENSList);

module.exports = router;
