const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name : {type:String, required: true},
    email:{type:String, required:true,unique:true},
    password:{type:String, required: true},
    role: {
        type:String,
        enum:["ADMIN","VENDOR","DELIVERY","CUSTOMER"],
        default:"CUSTOMER"
    },
     isApproved: {
      type: Boolean,
      default: function () {
        return this.role !== "VENDOR";
      }
    },
    isActive: {type: Boolean, default:true}
},
 { timestamps: true }
);

module.exports = mongoose.model("User",userSchema);