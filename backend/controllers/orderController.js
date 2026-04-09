const Order = require("../models/order");
const Cart = require("../models/cart");
const { addTimelineEvent } = require("../utils/orderTimeline");
const { canTransition } = require("../utils/orderState");
const Vendor = require("../models/vendor");
const Review = require("../models/review");
const { autoAssignDelivery } = require("../utils/autoAssignDelivery");
const { getIO } = require("../socket/index");


exports.placeOrder = async (req, res) => {
  const customerId = req.user.userId;
  console.log("REQ BODY:", req.body);
  
  const {address} = req.body;
  
  if (!address ) {
  return res.status(400).json({
    message: "Delivery address is required",
  });
}

   

  const cart = await Cart.findOne({ customerId }).populate("items.menuItem");

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is Empty" });
  }

  const formattedAddress = `${address.street}, ${address.city}, ${address.zipCode || ""}, Phone: ${address.phone || ""}`;

  const vendor = await Vendor.findById(cart.vendorId);
  if (!vendor) {
  return res.status(400).json({
    message: "Vendor not found",
  });
}
console.log("Cart vendorId:", cart.vendorId);
  const order = await Order.create({
    customerId,
    vendorId: vendor._id,
    items: cart.items.map((item) => ({
      menuItem: item.menuItem._id,
      name: item.menuItem.name,
      price: item.price,
      quantity: item.quantity,
    })),
    totalAmount: cart.totalAmount,
    deliveryAddress: address,
  
    
  });

  await Cart.findOneAndDelete({ customerId });

  await addTimelineEvent(order, "PLACED", "Order placed successfully");

  res.status(201).json(order);
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customerId: req.user.userId,
    })
      .populate("vendorId", "name")
      .populate("items.menuItem", "image")
      .populate({
        path: "deliveryPartnerId",
        select: "name phone",
      })
      .sort({ createdAt: -1 });

    const reviews = await Review.find({
      orderId: { $in: orders.map((o) => o._id) },
    });
    const reviewMap = {};
    reviews.forEach((r) => {
      reviewMap[r.orderId.toString()] = r;
    });

    const ordersWithReviews = orders.map((o) => ({
      ...o.toObject(),
      review: reviewMap[o._id.toString()] || null,
    }));

    res.json(ordersWithReviews);
  } catch (err) {
    res.status(500).json({ message: "failed to fetch orders" });
  }
};

exports.getVendorOrders = async (req, res) => {
  try {
    console.log("TOKEN USER:", req.user);
    const vendor = await Vendor.findOne({
      userId: req.user.userId,
    });
    if (!vendor) {
      return res.status(404).json({ message: "vendor not found" });
    }

    const orders = await Order.find({
      vendorId: vendor._id,
    })
      .populate("customerId", "name email phone")
      .populate("items.menuItem", "name image")
      .populate("deliveryPartnerId", "name phone")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const vendor = await Vendor.findOne({
    userId: req.user.userId,
  });
  if (!vendor) {
    return res.status(404).json({ message: "vendor not found" });
  }
  const order = await Order.findOne({
    _id: req.params.id,
    vendorId: vendor._id,
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (!canTransition(order.status, status)) {
    return res.status(400).json({
      message: `Invalid transition from ${order.status} to ${status}`,
    });
  }

  order.status = status;
  await order.save();

  await addTimelineEvent(order, status, `Order status updated to ${status}`);
  const io = getIO();

io.to(`vendor:${order.vendorId}`).emit("orderUpdated", order);

io.to(`order:${order._id}`).emit("orderTimelineUpdate", {
  orderId: order._id,
  status: order.status,
});
   
  console.log("Current status:", order.status);
console.log("Requested:", status);

  if (status === "READY") {
    console.log("🔥 READY reached - assigning delivery");
    const delivery = await autoAssignDelivery(order);
    console.log("🚚 Delivery found:", delivery);

    if (delivery) {
      order.deliveryPartnerId = delivery.userId;
      order.status = "DELIVERY_ASSIGNED";

      await order.save();

      await addTimelineEvent(
        order,
        "DELIVERY_ASSIGNED",
        "Delivery auto assigned",
      );

      const io = getIO();
      io.to(`user:${delivery.userId}`).emit("deliveryAssigned", {
        orderId: order._id,
      });

      if (order.deliveryPartnerId) {
        return res.status(400).json({
          message: "Delivery already assigned",
        });
      }
    } else {
      console.log("No delivery partner available");
    }
  }

  res.json(order);
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (["PICKED_UP", "DELIVERED"].includes(order.status)) {
      return res.status(400).json({
        message: "Order cannot be cancelled now",
      });
    }

    order.status = "CANCELLED";
    await order.save();

    res.json({ message: "Order cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Cancel failed" });
  }
};
