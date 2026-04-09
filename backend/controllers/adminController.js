const User = require("../models/user");
const Delivery = require("../models/deliveryProfile");
const Order = require("../models/order");
const { getIO } = require("../socket");
const { addTimelineEvent } = require("../utils/orderTimeline");

exports.getPendingVendors = async (req, res) => {
  try {
    const vendors = await User.find({
      role: "VENDOR",
      $or: [{ isApproved: false }, { isApproved: { $exists: false } }],
    }).select("-password");

    res.json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
};

exports.approveVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.vendorId);

    if (!vendor || vendor.role !== "VENDOR") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (vendor.isApproved) {
      return res.status(400).json({ message: "Vendor already approved" });
    }

    vendor.isApproved = true;
    await vendor.save();

    const existing = await vendor.findOne({vendorId: vendor.vendorId});
    if (!existingVendor) {
    await Vendor.create({
      vendorId: vendor.vendorId,
      restaurantName: user.name, // default
      address: {},
    });
  }

    res.json({ message: "Vendor approved" });
  } catch (error) {
    console.error("Vendor approval error:", error);
    res.status(500).json({ message: "Failed to approve vendor" });
  }
};

exports.getPendingDeliveryPartners = async (req, res) => {
  try {
    const pending = await Delivery.find({ isApproved: false }).populate(
      "userId",
      "name email"
    );

    res.json(pending);
  } catch (error) {
    console.error("Error fetching delivery partners:", error);
    res.status(500).json({ message: "Failed to fetch delivery partners" });
  }
};

exports.approveDeliveryPartner = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({
      userId: req.params.id
  });
    
    
    if (!delivery) {
      return res.status(404).json({ 
        message: "Delivery partner not found" });
    }

    delivery.isApproved = true;
    await delivery.save();

    await User.findByIdAndUpdate(delivery.userId, {
      isActive: true,
    });

    res.json({ message: "Delivery partner approved" });
  } catch (error) {
    console.error("Delivery approval error:", error);
    res.status(500).json({ message: "Failed to approve delivery partner" });
  }
};

// exports.assignDeliveryPartner = async (req, res) => {
//   try {
//     const { deliveryPartnerId } = req.body;

//     const order = await Order.findById(req.params.orderId);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (order.status !== "PREPARING") {
//       return res.status(400).json({
//         message: "Order must be at preparing before assignment",
//       });
//     }

//     const delivery = await Delivery.findOne({
//       userId: deliveryPartnerId,
//       isApproved: true,
//     });

//     if (!delivery) {
//       return res.status(404).json({
//         message: "Delivery partner not approved or not found",
//       });
//     }

//     order.deliveryPartnerId = deliveryPartnerId;
//     order.status = "DELIVERY_ASSIGNED";
//     await order.save();
//     console.log("After assignment:", order.status);
//     await addTimelineEvent(
//       order,
//       "DELIVERY_ASSIGNED",
//       "Delivery partner assigned"
//     );

//     const io = getIO();

//     io.to(`user:${deliveryPartnerId}`).emit("deliveryAssigned", {
//       orderId: order._id,
//     });

//     res.json({ message: "Delivery partner assigned" });
//   } catch (error) {
//     console.error("Delivery assignment error:", error);
//     res.status(500).json({ message: "Failed to assign delivery partner" });
//   }
// };