const User = require("../models/user");

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
        const {name,email} = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            {name,email},
            {new:true}
        ).select("-password");
        res.json(updatedUser);
    }catch(err){
        res.status(500).json({message:"failed to update profile"});
    }
};