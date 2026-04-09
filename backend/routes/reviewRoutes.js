const router = require("express").Router();
const { createReview, getPublicReviews, getVendorReviews, replyToReview } = require("../controllers/reviewController");
const {auth,allowRoles} = require("../middleware/authmiddleware");
const {vendorApprovedOnly} = require("../middleware/vendorApproval");


router.post("/", auth, createReview);

router.get("/:vendorId",getPublicReviews);

router.get("/",auth,allowRoles("VENDOR"), vendorApprovedOnly,getVendorReviews);
router.post("/:id/reply",auth,allowRoles("VENDOR"), vendorApprovedOnly,replyToReview);

module.exports = router;