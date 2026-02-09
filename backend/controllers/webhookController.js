const crypto = require("crypto");
const Order = require("../models/order");

exports.razorpayWebhook = async (req, res) => {
  try {
    console.log("🔥 WEBHOOK HIT");

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body) // <-- req.body IS RAW BUFFER NOW
      .digest("hex");

    if (expectedSignature !== signature) {
      console.log("❌ SIGNATURE MISMATCH");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const payload = JSON.parse(req.body.toString());
    const event = payload.event;

    console.log("EVENT:", event);

    if (event === "payment.captured") {
      const razorpayOrderId =
        payload.payload.payment.entity.order_id;

      console.log("ORDER ID FROM WEBHOOK:", razorpayOrderId);

      const order = await Order.findOneAndUpdate(
        { "payment.razorpayOrderId": razorpayOrderId },
        {
          $set: {
            "payment.status": "PAID",
            status: "PREPARING"
          }
        },
        { new: true }
      );

      console.log("UPDATED ORDER:", order?._id);
    }

    // ✅ VERY IMPORTANT — respond 200
    res.status(200).json({ status: "ok" });

  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    res.status(500).json({ message: "Webhook failed" });
  }
};
