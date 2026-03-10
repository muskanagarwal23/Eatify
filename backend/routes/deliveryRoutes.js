const router = require("express").Router();
const upload = require("../middleware/uploadMiddleware");
const {registerDelivery, getAssignedOrders, updateDeliveryStatus} = require("../controllers/deliveryController");
const { allowRoles,auth } = require("../middleware/authmiddleware");
const {validate} = require("../middleware/validate");
const {assignDeliverySchema, deliveryStatusSchema} = require("../validators/orderValidator");

router.post("/register", upload.single("license"),
registerDelivery);

router.get("/orders", auth, allowRoles("DELIVERY"), getAssignedOrders);

router.patch("/orders/:orderId/status", auth, allowRoles("DELIVERY"), validate(deliveryStatusSchema),updateDeliveryStatus )

module.exports = router;