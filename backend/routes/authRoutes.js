// console.log("Auth routes loaded");
const router = require("express").Router();
const {register, login} = require("../controllers/authController");
const {validate} = require("../middleware/validate");
const {registerSchema, loginSchema} = require("../validators/authValidator");
const upload = require("../middleware/uploadMiddleware");

router.post("/register", 
    upload.single("document"),
    validate(registerSchema),
    register);
    
router.post("/login",validate(loginSchema), login);


module.exports = router;