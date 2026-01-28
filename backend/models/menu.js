const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
    {
        vendorId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        name:{
            type:String,
            required:true
        },
        description:String,
        price:{
            type:Number,
            required:true
        },
        category:String,
        image:{
         img_url:String,
         publicId:String
        },
        
        isAvailable:{
            type:Boolean,
            default:true
        }
    },
    { timestamps: true}
);

module.exports = mongoose.model("menu",menuSchema);