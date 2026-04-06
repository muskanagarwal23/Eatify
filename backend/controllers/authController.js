const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, 
    email, 
    password, 
    role,
  licenseNumber } = req.body;

  if (role === "ADMIN") {
    return res.status(403).json({ message: "admin not allowed" });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("FILE:",req.file);
  
  await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    licenseNumber,
    documentUrl:req.file?.originalname  || null,
    isApproved: role === "VENDOR" ? false : true
  });

  if (role === "VENDOR" && !req.file) {
  return res.status(400).json({
    message: "Document is required for vendor"
  });
}

  res.json({
  message: 
  role === "VENDOR"
  ? "Registered. Wait for admin approval"
  : "Registered Successfully",
  user: {
    name,
    email,
    role,
  },
});
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
