const express = require("express");
const router = express.Router();
const {getMyProfile, updateMyProfile} = require("../controllers/userController");

const {auth} = require("../middleware/authmiddleware");

router.get("/user",auth,getMyProfile);
router.put("/user",auth,updateMyProfile);


module.exports = router;