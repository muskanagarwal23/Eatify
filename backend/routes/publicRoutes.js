const router = require("express").Router();
const { getRestaurants, 
    getVendorMenu,getRestaurantById, 
    getPublicReviews} = require("../controllers/publicController");

router.get("/restaurants",getRestaurants);
router.get("/restaurants/:id", getRestaurantById);
router.get("/menu/:vendorId",getVendorMenu);


module.exports = router;