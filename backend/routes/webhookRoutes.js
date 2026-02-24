const express = require("express");
const router = express.Router();
const { razorpayWebhook } = require("../controllers/webhookController");
//const rawBodySaver = require("../middleware/rawBody");

router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

module.exports = router;
