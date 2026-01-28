const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
            unique:true
        },
        restaurantName:{
            type:String,
            required:true
        },
        description:String,
        cuisineType:[String],
        address:{
            street:String,
            city:String,
            state:String,
            pincode:String
        },
        isOpen:{
            type:Boolean,
            default:true
        }
    },
    { timestamps: true}
);

module.exports = mongoose.model("Vendor",vendorSchema);