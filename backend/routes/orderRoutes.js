const router = require("express").Router();
const {auth,allowRoles } = require("../middleware/authmiddleware");
const {placeOrder, 
    getMyOrders, 
    getVendorOrders, 
    updateOrderStatus } = require("../controllers/orderController");


    router.post("/",auth,allowRoles("CUSTOMER"), placeOrder);

    router.get("/my_orders", auth, allowRoles("CUSTOMER"), getMyOrders);

    router.get("/vendor_orders",auth,allowRoles("VENDOR"), getVendorOrders);

    router.patch("/:id/status", auth,
        allowRoles("VENDOR"), updateOrderStatus
    );

    module.exports = router;