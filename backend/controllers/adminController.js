const User = require("../models/user");

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