const mongoose = require('mongoose')

const userModel = new  mongoose.Schema({
    firstName:{
        type :String,
        required:true
    },
    lastName:{
        type :String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phoneNumber :{
        type:String,
        required:true,  
    },
    password:{
        type:String,
        required:true
    },
    otp: { type: String },
    otpExpires: { type: Date },

    isVerified :{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})



module.exports =mongoose.model("User", userModel)