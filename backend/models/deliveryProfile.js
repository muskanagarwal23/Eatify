const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true
    },
    vehicleNumber: {
      type: String,
      required: true
    },
    licenseDocument: {
      url: String,
      publicId: String
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Delivery", deliverySchema);
