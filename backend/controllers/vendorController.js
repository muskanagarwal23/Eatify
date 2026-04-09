const Vendor = require("../models/vendor");
const Menu = require("../models/menu");
const mongoose = require("mongoose");
const Review = require("../models/review");

exports.registerVendor = async (req, res) => {
  try {
    const { name, email, password, licenseNumber } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const documentUrl = req.file?.path;

    const user = new User({
      name,
      email,
      password,
      role: "VENDOR",
      licenseNumber,
      documentUrl,
      isApproved: false, // 🔥 important
    });

    await user.save();

    res.status(201).json({
      message: "Vendor registered. Waiting for admin approval.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.createOrUpdateProfile = async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);
  try {
    const vendorId = req.user.userId;

    const {
      restaurantName,
      description,
      phone,
      avgPrice,
      rating,
      deliveryTime,
      isOpen,
    } = req.body;

    const cuisine = Array.isArray(req.body.cuisine)
      ? req.body.cuisine
      : [req.body.cuisine];

    const address = {
      street: req.body.street,
      city: req.body.city,
      zipCode: req.body.zipCode,
    };
    const bannerFile = req.files?.banner?.[0];

    const bannerUrl = bannerFile
      ? `data:${bannerFile.mimetype};base64,${bannerFile.buffer.toString("base64")}`
      : undefined;

    const profile = await Vendor.findOneAndUpdate(
      { userId: vendorId },
      {
        restaurantName,
        description,
        address,
        phone,
        cuisine: cuisine,
        avgPrice,
        rating,
        deliveryTime,
        isOpen,
        ...(bannerUrl && { bannerUrl }),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    res.json(profile);
  } catch (error) {
    console.error("Vendor profile error:", error);
    res.status(500).json({
      message: "Failed to update vendor profile",
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Vendor.findOne({
      userId: req.user.userId,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Vendor profile not found",
      });
    }

    res.json(profile);
  } catch (error) {
    console.error("Fetch vendor profile error:", error);

    res.status(500).json({
      message: "Failed to fetch vendor profile",
    });
  }
};

