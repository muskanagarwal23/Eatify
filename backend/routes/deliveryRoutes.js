const router = require("express").Router();
const upload = require("../middleware/uploadMiddleware");
const {registerDelivery} = require("../controllers/deliveryController");

router.post("/register", upload.single("license"),
registerDelivery);

router.get("/pending-delivery", )

module.exports = router;