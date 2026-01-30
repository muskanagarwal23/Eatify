const router = require("express").Router();
const { getRestaurants, getVendorMenu } = require("../controllers/publicController");

router.get("/restaurants",getRestaurants);
router.get("/menu/:vendorUserId",getVendorMenu);

module.exports = router;