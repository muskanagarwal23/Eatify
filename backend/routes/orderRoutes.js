const router = require("express").Router();
const {auth,allowRoles } = require("../middleware/authmiddleware");
const {placeOrder, 
    getMyOrders, 
    getVendorOrders, 
    updateOrderStatus, 
    cancelOrder,
    rateOrder} = require("../controllers/orderController");
const {validate} = require("../middleware/validate");
const {placeOrderSchema, updateOrderStatusSchema} = require("../validators/orderValidator");

    router.post("/",auth,allowRoles("CUSTOMER"), validate(placeOrderSchema),placeOrder);

    router.get("/my_orders", auth, allowRoles("CUSTOMER"), getMyOrders);

    router.get("/vendor_orders",auth,allowRoles("VENDOR"), getVendorOrders);

    router.put("/:orderId/cancel",auth,allowRoles("CUSTOMER"),cancelOrder);
    
     router.put("/:orderId/rate",auth,allowRoles("CUSTOMER"),rateOrder);

    router.patch("/:id/status", auth,
        allowRoles("VENDOR"), 
        validate(updateOrderStatusSchema),
        updateOrderStatus
    );

    module.exports = router;