const Delivery = require("../models/deliveryProfile");

exports.autoAssignDelivery = async (order) => {
  try {
    // 🔥 find available delivery partners
    const availablePartners = await Delivery.find({
      isApproved: true,
      isAvailable: true,
    });

    if (!availablePartners.length) {
      console.log("❌ No delivery partners available");
      return null;
    }

    // 🔥 simple random selection (can upgrade later)
    const selected =
      availablePartners[
        Math.floor(Math.random() * availablePartners.length)
      ];

    // 🔥 assign
    selected.isAvailable = false;
    selected.currentOrder = order._id;
    await selected.save();

    return selected;

  } catch (err) {
    console.error("Auto assign error:", err);
    return null;
  }
};