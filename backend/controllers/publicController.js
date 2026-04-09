const User = require("../models/user");
const Vendor = require("../models/vendor");
const Menu = require("../models/menu");
const Review = require("../models/review");

exports.getRestaurants = async (req, res) => {
  try {
    const vendors = await Vendor.find({ isOpen: true })
      .populate({
        path: "userId",
        match: {
          role: "VENDOR",
          isApproved: true,
          isActive: true
        },
        select: "name"
      })
      .select("restaurantName cuisineType address avgPrice rating isOpen userId");

    // remove unapproved vendors
    const filtered = vendors.filter(v => v.userId);

    // 🔥 ATTACH MENU TO EACH VENDOR
    const result = await Promise.all(
      filtered.map(async (vendor) => {
        const menuItems = await Menu.find({
          vendorId: vendor._id,
          isAvailable: true
        }).select("name");

        return {
          ...vendor.toObject(),
          menu: menuItems   // ✅ THIS FIXES EVERYTHING
        };
      })
    );

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch restaurants" });
  }
};

exports.getVendorMenu = async (req, res) => {
  const items = await Menu.find({
    vendorId: req.params.vendorId,
    isAvailable: true
  }).select("name description price category image");

  res.json(items);
};

exports.getRestaurantById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

