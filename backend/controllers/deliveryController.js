const bcrypt = require("bcrypt");
const User = require("../models/user");
const Delivery = require("../models/deliveryProfile");
const cloudinary = require("../config/cloudinary");
const Order = require("../models/order");
const { getIO } = require("../socket");
const { addTimelineEvent } = require("../utils/orderTimeline");
const { canTransition } = require("../utils/orderState");
const Vendor = require("../models/vendor");

exports.getAssignedOrders = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    const orders = await Order.find({
      deliveryPartnerId: req.user.userId,
    })
      .populate("vendorId", "name email")
      .populate("customerId", "name phone")
      .sort({ createdAt: -1 });
      const ordersWithVendor = orders.map(order => {
  const vendor = vendors.find(v => 
    v.userId.toString() === order.vendorId?._id.toString()
  );
   return {
    ...order.toObject(),
    vendorDetails: vendor || null
  };
});

    res.json(ordersWithVendor);
  } catch (error) {
    console.error("Fetch assigned orders error:", error);
    res.status(500).json({ message: "Failed to fetch assigned orders" });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];

    const order = await Order.findOne({
      _id: req.params.orderId,
      deliveryPartnerId: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }
    console.log("Current:", order.status);
    console.log("Requested:", status);

    if (status === "PICKED_UP" && order.status !== "DELIVERY_ASSIGNED") {
      return res.status(400).json({
        message: "Order must be assigned before pickup",
      });
    }

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: "Invalid delivery status",
      });
    }

    

    if (!canTransition(order.status, status)) {
      return res.status(400).json({
        message: `Invalid transition from ${order.status} to ${status}`,
      });
    }

    order.status = status;
    await order.save();

    const delivery = await Delivery.findOne({
      userId: req.user.userId,
    });

    if (!delivery) {
      return res.status(404).json({
        message: "Delivery profile not found",
      });
    }

    if (status === "PICKED_UP") {
      delivery.isAvailable = false;
      delivery.currentOrder = order._id;
    }
    if (status === "DELIVERED") {
      delivery.isAvailable = true;
      delivery.currentOrder = null;
    }
    
    try{
    await delivery.save();
    }catch(err){
      console.error("Delivery Save error:", err)
    }
    await addTimelineEvent(
      order,
      status,
      status === "PICKED_UP"
        ? "Order picked up by delivery partner"
        : "Order delivered successfully",
    );

    const io = getIO();

    if (io) {
  io.to(`order:${order._id}`).emit("deliveryStatusUpdated", {
    orderId: order._id,
    status,
  });
}

    io.to(`order:${order._id}`).emit("deliveryStatusUpdated", {
      orderId: order._id,
      status,
    });

    res.json(order);
  } catch (error) {
    console.error("Delivery update error:", error);
    res.status(500).json({
      message: "Failed to update delivery status",
    });
  }
};
