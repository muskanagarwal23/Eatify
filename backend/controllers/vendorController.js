const Vendor = require("../models/vendor");

exports.createOrUpdateProfile = async (req,res) => {
    const vendorId = req.user.userId;

    const profile = await Vendor.findOneAndUpdate(
        { userId: vendorId},
        {...req.body, userId:vendorId},
        {new:true, upsert:true}
    );
    res.json(profile);
};

exports.getMyProfile = async (req,res) => {
    const profile = await Vendor.findOne({ userId:req.user.userId});
    
    if(!profile) {
        return res.status(404).json({message:"vendor profile not found"});
    }
    
    res.json(profile);
};