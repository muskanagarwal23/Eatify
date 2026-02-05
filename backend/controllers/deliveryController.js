const bcrypt = require("bcrypt");
const User = require("../models/user");
const Delivery = require("../models/deliveryProfile");
const cloudinary = require("../config/cloudinary");
const Order = require("../models/order");

exports.registerDelivery = async (req, res, next) => {
  try {
    const { name, email, password, licenseNumber, vehicleNumber } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "License document required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "DELIVERY",
      isActive: false,
    });

    const uploadLicense = () =>
      new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "eatify/delivery-licenses",
              resource_type: "raw",
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          )
          .end(req.file.buffer);
      });

    const uploadResult = await uploadLicense();

    await Delivery.create({
      userId: user._id,
      licenseNumber,
      vehicleNumber,
      licenseDocument: {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      },
    });

    res.status(201).json({
      message: "Delivery partner registered. Await admin approval.",
    });
  } catch (err) {
    next(err);
  }
};

exports.getAssignedOrders = async (req, res) => {
  const orders = await Order.find({
    deliveryPartnerId: req.user.userId
  }).sort({ createdAt: -1 });

  res.json(orders);
};

exports.updateDeliveryStatus = async (req, res) => {
  const { status } = req.body;

  const allowed = ["PICKED_UP", "DELIVERED"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid delivery status" });
  }

  const order = await Order.findOne({
    _id: req.params.orderId,
    deliveryPartnerId: req.user.userId
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.deliveryStatus = status;

  if (status === "DELIVERED") {
    order.status = "DELIVERED";
  }

  await order.save();
  res.json(order);
};