require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const seedAdmin = async() => {
    await mongoose.connect(process.env.MONGO_URI);

    const exists = await User.findOne({role:"ADMIN"});
    if(exists) {
        console.log("Admin already exists");
        process.exit(0);
        
    }

    const hashedPassword = await bcrypt.hash("Admin@123",10);

    await User.create({
        name: "Super Admin",
        email:"admin@eatify.com",
        password:hashedPassword,
        role:"ADMIN",
        isApproved:true
    });

    console.log("Admin created");
    process.exit(0);
    
};

seedAdmin();