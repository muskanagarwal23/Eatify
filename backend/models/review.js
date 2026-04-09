const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    rating: {
      value: { type: Number, required: true, min: 1, max: 5 },
      review: { type: String },
    },

    reply: {
      type: String,
      default: null,
    },

    repliedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);