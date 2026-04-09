const Review = require("../models/review");
const Order = require("../models/order");
const Vendor = require("../models/vendor");

exports.createReview = async (req, res) => {
  try {
    const { orderId, rating, review } = req.body;
    const userId = req.user.userId;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only delivered orders
    if (order.status !== "DELIVERED") {
      return res.status(400).json({
        message: "You can review only delivered orders",
      });
    }

    // Prevent duplicate review
    const existing = await Review.findOne({ orderId });
    if (existing) {
      return res.status(400).json({
        message: "Review already submitted",
      });
    }

    const newReview = await Review.create({
      customerId: userId,
      vendorId: order.vendorId,
      orderId,
      rating: {
        value: rating,
        review,
      },
    });

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: "Failed to create review" });
  }
};

exports.getPublicReviews = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const reviews = await Review.find({ vendorId })
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

exports.getVendorReviews = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });

    const reviews = await Review.find({ vendorId: vendor._id })
      .populate("customerId", "name")
      .populate("orderId", "_id")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

exports.replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;

    const review = await Review.findById(req.params.id);
    
    const io = req.app.get("io");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.reply = reply;
    review.repliedAt = new Date();
    
    io.to(review.customerId.toString()).emit("reviewReply", {
      orderId: review.orderId,
      reply: review.reply
    });
    
    await review.save();


    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Failed to reply" });
  }
};