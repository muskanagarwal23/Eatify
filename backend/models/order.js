const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "menu",
    required: true,
  },
  name: String,
  price: Number,
  quantity: Number,
});

const OrderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: Number,
    status: {
      type: String,
      enum: [
        "PLACED",
        "PAID",
        "ACCEPTED",
        "REJECTED",
        "PREPARING",
        "DELIVERY_ASSIGNED",
        "PICKED_UP",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
    },
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    payment: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      status: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING",
      },
    },
    rating: {
      value: { type: Number, default: null },
      review: { type: String, default: "" },
    },
    timeline: [
      {
        status: String,
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", OrderSchema);
