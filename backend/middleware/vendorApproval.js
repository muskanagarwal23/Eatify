const User = require("../models/user");

exports.vendorApprovedOnly = async (req,res,next) => {
    if(req.user.role === "VENDOR" ) {
        return next();
    }
    
    const vendor = await User.findById(req.User.userId).select("isApproved");

    if(!vendor || !vendor.isApproved) {
        return res.status(403).json({message:"Vendor not approved"});
    }
    next();
};