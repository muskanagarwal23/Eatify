const User = require("../models/user");
const Review = require("../models/review");

exports.getMyProfile = async (req,res) => {
    try{
        const user = await User.findById(req.user.userId)
        .select("-password");

        if (!user){
            return res.status(404).json({message:"USer not found"});
        }
        res.json(user);
    }catch(err){
        res.status(500).json({message:"failed to fetch profile"});
    }
};

exports.updateMyProfile = async (req,res) => {
    try{
        const {name,email, phone, address} = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            {name,email, phone, address},
            {new:true}
        ).select("-password");
        res.json(updatedUser);
    }catch(err){
        res.status(500).json({message:"failed to update profile"});
    }
};

