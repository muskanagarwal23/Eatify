const Vendor = require("../models/vendor");

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const vendorId = req.user.userId;

    const {
      restaurantName,
      description,
      address,
      phone,
      cuisine
    } = req.body;

    const profile = await Vendor.findOneAndUpdate(
      { userId: vendorId },
      {
        userId: vendorId,
        restaurantName,
        description,
        address,
        phone,
        cuisine
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.json(profile);

  } catch (error) {
    console.error("Vendor profile error:", error);
    res.status(500).json({
      message: "Failed to update vendor profile"
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Vendor.findOne({
      userId: req.user.userId
    });

    if (!profile) {
      return res.status(404).json({
        message: "Vendor profile not found"
      });
    }

    res.json(profile);

  } catch (error) {
    console.error("Fetch vendor profile error:", error);

    res.status(500).json({
      message: "Failed to fetch vendor profile"
    });
  }
};