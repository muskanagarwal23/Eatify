const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    restaurantName: {
      type: String,
      required: true,
    },
    description: String,
    cuisine: [String],
    avgPrice: {
      type: Number,
      required: true,
      default: 300,
    },
    rating: { 
      type: String,
      required: true,
    },
    deliveryTime: String,

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    bannerUrl: {
      url: String,
      publicId: String
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Vendor", vendorSchema);
