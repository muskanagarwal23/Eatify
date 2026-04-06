const router = require("express").Router();
const {auth, allowRoles} = require("../middleware/authmiddleware");
const {
  addToCart,
  getCart,
  updateQuantity,
  removeItem
} = require("../controllers/cartController");

router.post("/add", auth, allowRoles("CUSTOMER"), addToCart);
router.get("/", auth, allowRoles("CUSTOMER"), getCart);
router.patch("/update", auth, allowRoles("CUSTOMER"), updateQuantity);
router.delete("/:itemId", auth, allowRoles("CUSTOMER"), removeItem);

module.exports = router;
