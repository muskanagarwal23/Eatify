const router = require("express").Router();
const {auth, allowRoles} = require("../middleware/authmiddleware");

router.get("/admin",auth,allowRoles("ADMIN"), (req,res) => {
    res.json({message: "Admin route accessed"});
});

router.get("/vendor",auth,allowRoles("VENDOR"), (req,res) => {
    res.json({message: "Vendor route accessed"});
});

router.get("/customer",auth,allowRoles("CUSTOMER"), (req,res) => {
    res.json({message: "Customer route accessed"});
});

module.exports = router;