const razorpay = require("../config/razorpay");
const Order = require("../models/order");
const crypto = require("crypto");


exports.createPaymentOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      customerId: req.user.userId
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.totalAmount || order.totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    if (order.payment?.status === "PAID") {
      return res.status(400).json({ message: "Order already paid" });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: order.totalAmount * 100,
      currency: "INR",
      receipt: `order_${order._id}`
    });

    order.payment = {
      razorpayOrderId: razorpayOrder.id,
      status: "PENDING"
    };

    await order.save();

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      checkoutUrl: `https://checkout.razorpay.com/v1/checkout.js`
    });

  } catch (error) {
    console.error("RAZORPAY ERROR:", error);
    res.status(500).json({
      message: "Payment order creation failed",
      error: error.message || error
    });
  }
};



exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const order = await Order.findOne({
      "payment.razorpayOrderId": razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.razorpaySignature = razorpay_signature;
    order.payment.status = "PAID";
    order.status = "PREPARING";

    await order.save();

    res.json({ message: "Payment verified successfully" });
  } catch (err) {
    next(err);
  }
};