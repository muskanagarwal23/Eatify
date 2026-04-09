const crypto = require("crypto");
const Order = require("../models/order");
const { addTimelineEvent } = require("../utils/orderTimeline");
const { canTransition } = require("../utils/orderState");

exports.razorpayWebhook = async (req, res) => {
  try {
    console.log("🔥 WEBHOOK HIT");

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature !== signature) {
      console.log("❌ SIGNATURE MISMATCH");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const payload = JSON.parse(req.body.toString());
    const event = payload.event;

    console.log("EVENT:", event);

    if (event === "payment.captured") {
      console.log("PAYMENT CAPTURED EVENT RECEIVED");
      const razorpayOrderId = payload.payload.payment.entity.order_id;

      console.log("ORDER ID FROM WEBHOOK:", razorpayOrderId);

      const order = await Order.findOne({
        "payment.razorpayOrderId": razorpayOrderId,
      });

      if (!order) {
        console.log("⚠️ Order not found for Razorpay order");
        return res.status(200).json({ status: "ignored" });
      }

      if (!canTransition(order.status, "PAID")) {
        return res.status(400).json({
          message: "Invalid order state transition",
        });
      }

      order.payment.status = "PAID";
      order.status = "PAID";
      console.log("CURRENT ORDER STATUS:", order.status);

      //console.log("ADDING TIMELINE EVENT");

      await addTimelineEvent(order, "PAID", "Payment confirmed successfully");

      //console.log("UPDATED ORDER:", order._id);
      await order.save();

       const { getIO } = require("../socket");
    const io = getIO();

    console.log("📡 Emitting update for:", order._id);

    io.to(`order:${order._id}`).emit("orderStatusUpdated", {
      timeline: order.timeline,
    });
    }
    

   
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    res.status(500).json({ message: "Webhook failed" });
  }
};
