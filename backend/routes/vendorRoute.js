const router = require("express").Router();
const {auth,allowRoles} = require("../middleware/authmiddleware");
const {vendorApprovedOnly} = require("../middleware/vendorApproval");
const {createOrUpdateProfile, getMyProfile} = require("../controllers/vendorController");
const vendor = require("../models/vendor");
const upload = require("../middleware/uploadMiddleware")

router.get("/dashboard",auth,allowRoles("VENDOR"), vendorApprovedOnly,
(req,res) => {
    res.json({message:"vendor dashboard access"});
});

router.post("/profile",
    auth,
    allowRoles("VENDOR"), 
    vendorApprovedOnly,
    upload.fields([
        {name:"banner",maxCount:1},
        {name:"profileImage",maxCount:1}
    ]),
    createOrUpdateProfile);

router.get("/profile",auth,allowRoles("VENDOR"), vendorApprovedOnly,getMyProfile);

module.exports = router;