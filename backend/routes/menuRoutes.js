const router = require("express").Router();
const {auth,allowRoles} = require("../middleware/authmiddleware");
const { vendorApprovedOnly } = require("../middleware/vendorApproval");
const upload = require("../middleware/uploadMiddleware");
const { createMenu, getMyMenu, updateMenuItem, deleteMenuItem, toggleAvailability} = require("../controllers/menuController");

router.post("/",auth,allowRoles("VENDOR"),
vendorApprovedOnly,upload.single("image"),
createMenu );

router.get("/",auth,allowRoles("VENDOR"),
vendorApprovedOnly,
getMyMenu );

router.put(
  "/:id",
  auth,
  allowRoles("VENDOR"),
  vendorApprovedOnly,
  upload.single("image"),
  updateMenuItem
);

router.delete(
  "/:id",
  auth,
  allowRoles("VENDOR"),
  vendorApprovedOnly,
  deleteMenuItem
);

router.patch(
  "/:id/toggle",
  auth,
  allowRoles("VENDOR"),
  vendorApprovedOnly,
  toggleAvailability
);


module.exports = router;
