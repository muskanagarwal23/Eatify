const User = require("../models/user");
const Delivery = require("../models/deliveryProfile")

exports.getPendingVendors = async (requestAnimationFrame,res) => {
    const vendors = await User.find({
        role:"VENDOR",
          $or: [
      { isApproved: false },
      { isApproved: { $exists: false } }
    ]
    }).select("-password");
    res.json(vendors);
};

exports.approveVendor = async (req, res) => {
    const vendor = await User.findById(req.params.vendorId);
    
    if(!vendor || vendor.role !== "VENDOR") {
        return res.status(404).json({message:"vendor not found"});
    }
    if (vendor.isApproved) {
    return res.status(400).json({ message: "Vendor already approved" });
  }


    vendor.isApproved = true;
    await vendor.save();

    res.json({message:"vendor approved"});
};

exports.getPendingDeliveryPartners = async (req, res) => {
  const pending = await Delivery.find({ isApproved: false })
    .populate("userId", "name email");

  res.json(pending);
};

exports.approveDeliveryPartner = async (req, res) => {
  const delivery = await Delivery.findById(req.params.id);

  if (!delivery) {
    return res.status(404).json({ message: "Delivery partner not found" });
  }

  delivery.isApproved = true;
  await delivery.save();

  await User.findByIdAndUpdate(delivery.userId, {
    isActive: true
  });

  res.json({ message: "Delivery partner approved" });
};

