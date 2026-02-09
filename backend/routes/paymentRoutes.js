const router = require("express").Router();
const {auth,allowRoles} = require("../middleware/authmiddleware");
const {createPaymentOrder, verifyPayment} = require("../controllers/paymentController");

router.post("/create-order/:orderId", auth, allowRoles("CUSTOMER"), createPaymentOrder);
router.post("/verify", verifyPayment);

module.exports = router;