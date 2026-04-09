const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Delivery = require("../models/deliveryProfile");
const Vendor = require("../models/vendor");
const cloudinary = require("../config/cloudinary");

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      licenseNumber,
      vehicleNumber,
    } = req.body;

    if (role === "ADMIN") {
      return res.status(403).json({ message: "admin not allowed" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 🔥 VALIDATION BEFORE USER CREATION
    if ((role === "DELIVERY" || role === "VENDOR") && !req.file) {
      return res.status(400).json({
        message: "Document is required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isActive: role === "CUSTOMER",
    });

    // ================= DELIVERY =================
    if (role === "DELIVERY") {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "eatify/delivery-licenses",
              resource_type: "raw",
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      await Delivery.create({
        userId: user._id,
        licenseNumber,
        vehicleNumber,
        licenseDocument: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        },
      });
    }

    // ================= VENDOR =================
    if (role === "VENDOR") {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "eatify/vendor-licenses",
              resource_type: "raw",
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      await Vendor.create({
        userId: user._id,
        licenseNumber,
        licenseDocument: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        },
      });
    }

    res.json({
      message:
        role === "DELIVERY" || role === "VENDOR"
          ? "Registered. Wait for admin approval"
          : "Registered Successfully",
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("JWT SECRET (LOGIN):", process.env.JWT_SECRET);

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  if (user.role === "DELIVERY" && !user.isActive) {
    return res.status(403).json({
      message: "Delivery partner not approved yet",
    });
  }

   if (user.role === "VENDOR" && !user.isActive) {
    return res.status(403).json({
      message: "Vendor not approved yet",
    });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.json({
  token,
  user: {
    userId: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});
};
