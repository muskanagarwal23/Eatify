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
        "ACCEPTED",
        "REJECTED",
        "PREPARING",
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
    deliveryStatus: {
      type: String,
      enum: ["PENDING", "ASSIGNED", "PICKED_UP", "DELIVERED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", OrderSchema);
