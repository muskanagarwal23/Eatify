const router = require("express").Router();
const {auth,allowRoles} = require("../middleware/authmiddleware");
const {getPendingVendors, 
    approveVendor, getPendingDeliveryPartners,
    approveDeliveryPartner,
assignDeliveryPartner} = require("../controllers/adminController");

router.get("/pending-vendors", auth, allowRoles("ADMIN"), getPendingVendors);
router.patch("/approve-vendor/:vendorId",auth,allowRoles("ADMIN"),approveVendor);
router.get("/pending-delivery", auth, allowRoles("ADMIN"), getPendingDeliveryPartners);
router.patch("/approve-delivery/:id", auth, allowRoles("ADMIN"), approveDeliveryPartner);
router.patch("/assign-delivery/:orderId", auth, allowRoles("ADMIN"), assignDeliveryPartner);
module.exports = router;