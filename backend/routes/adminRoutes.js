const router = require("express").Router();
const {auth,allowRoles} = require("../middleware/authmiddleware");
const {getPendingVendors, approveVendor} = require("../controllers/adminController");

router.get("/pending-vendors", auth, allowRoles("ADMIN"), getPendingVendors);
router.patch("/approve-vendor/:vendorId",auth,allowRoles("ADMIN"),approveVendor);

module.exports = router;