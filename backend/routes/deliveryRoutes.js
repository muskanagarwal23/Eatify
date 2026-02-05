const router = require("express").Router();
const upload = require("../middleware/uploadMiddleware");
const {registerDelivery, getAssignedOrders, updateDeliveryStatus} = require("../controllers/deliveryController");
const { allowRoles,auth } = require("../middleware/authmiddleware");

router.post("/register", upload.single("license"),
registerDelivery);

router.get("/orders", auth, allowRoles("DELIVERY"), getAssignedOrders);

router.patch("/orders/:orderId/status", auth, allowRoles("DELIVERY"),updateDeliveryStatus )

module.exports = router;