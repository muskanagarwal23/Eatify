const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async(req,res) => {
    const {name, email, password, role} = req.body;

    if(role === "ADMIN") {
        return res.status(403).json({message: "admin not allowed"});
    }

    const exists = await User.findOne({email});
    if(exists) {
        return res.status(409).json({message:"User already exists"});
    }

    const hashedPassword = await bcrypt.hash(password,10);

    await User.create({
        name,email,password: hashedPassword, role
    });

    res.json({message: "Registered Seccessfully"});
};

exports.login = async (req,res) => {
    const {email,password} = req.body;
    console.log("JWT SECRET (LOGIN):", process.env.JWT_SECRET);

    const user = await User.findOne({email});
    if(!user) {
        return res.status(401).json({message:"Invalid Credentials"});
    }

    const match = await bcrypt.compare(password, user.password);
    if(!match){
        return res.status(401).json({message:"Invalid Credentials"});
    }

    const token = jwt.sign(
        {userId : user._id, role: user.role},
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
    );

    res.json({
        token,role: user.role
    });
};