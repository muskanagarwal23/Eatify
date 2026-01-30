const User = require("../models/user");
const Vendor = require("../models/vendor");
const Menu = require("../models/menu");

exports.getRestaurants = async (req, res) => {
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
    .select("restaurantName cuisineType address isOpen");

  // remove vendors whose user is not approved
  const filtered = vendors.filter(v => v.userId);

  res.json(filtered);
};

exports.getVendorMenu = async (req, res) => {
  const items = await Menu.find({
    vendorId: req.params.vendorUserId,
    isAvailable: true
  }).select("name description price category image");

  res.json(items);
};