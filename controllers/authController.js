const User = require ('../models/user')
const Profile = require ("../models/profile")
const bcryptjs = require('bcryptjs')
const asyncHandler = require("express-async-handler")
const generateToken = require("../utils/generateToken")
const {createUserName} = require("../utils/generateUsername")
const sendOTPEmail = require('../services/smsServices')

// Function to generate a numeric OTP
const generateNumericOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    return otp.toString();
};



const registerUser = asyncHandler(async(req,res)=>{
 const {firstName,lastName, phoneNumber,email,password}= req.body

if(!firstName || !lastName ||!phoneNumber  || !email || !password){
    res.status(400);
    throw new Error("Please fill in all fields");
}

const existingUser = await User.findOne({email})

if(existingUser){
    res.status(400);
    throw new Error("User already exists");
}

const hashedPassword = await bcryptjs.hash(password, 10)

const otp = generateNumericOTP();
const otpExpires = new Date(Date.now() + 10 * 60 * 1000);


const user = await User.create({
     firstName,
     lastName,
     phoneNumber,
    email,
    otp,
    otpExpires,
    password:hashedPassword
})



const profile = await  new Profile({
    user: user._id,
    username : createUserName(user.firstName)
})

await profile.save()


try {
    await sendOTPEmail(email, otp);
} catch (error) {
    console.error('Error sending OTP email:', error.message);
    return res.status(500).json({ message: 'User registered, but failed to send OTP' });
}


if (user && profile) {
    res.status(201).json({
        _id: user._id,
        username: profile.username,
        profilePic: profile.profilePic,
        profileId: profile._id,
        email: user.email,
    })}else{
        res.status(400);
        throw new Error("Invalid user data");

    }
})


const verifyOtp = asyncHandler(async(req,res)=>{
  const {otp}= req.body
  if(!otp){
    res.status(400);
        throw new Error("Otp is Required");  
  }

  try {
    const user = await User.findOne({ otp });

    if (!user) {
        return res.status(400).json({ message: 'User not found or OTP is incorrect' });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Account verified' });
} catch (error) {
    console.error('Error occurred during OTP verification:', error);
    res.status(500).json({ message: 'Server error during OTP verification', error: error.message });
}
})


 const requestOtp = async (req, res) => {

  const { email } = req.body;

  if(!email){
    throw new Error("Email is Required");  
  } 

  try {
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(400).json({ message: 'User not found' });
      }

      if (user.isVerified) {
          return res.status(400).json({ message: 'Account already verified' });
      }

      const otp = generateNumericOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      user.otp = otp;
      user.otpExpires = otpExpires;

      await user.save();

      try {
          await sendOTPEmail(user.email, otp);
      } catch (error) {
          console.error('Error sending OTP email:', error.message);
          return res.status(500).json({ message: 'Failed to send new OTP' });
      }

      res.status(200).json({ message: 'New OTP sent to email.' });
  } catch (error) {
      console.error('Error occurred during OTP request:', error);
      res.status(500).json({ message: 'Server error during OTP request', error: error.message });
  }
};


const loginUser = asyncHandler(async(req,res)=>{
    
    const {email,password}= req.body
    if(!email || !password){
        res.status(400);
        throw new Error("Please fill in all fields"); 
    }
    const existingUser = await User.findOne({email})
    if(!existingUser){
        res.status(400);
        throw new Error("User not found, please signup");
    }
    if(!existingUser.isVerified){
      res.status(400)
      throw new Error("Please Verify Your Account");
    }

 const isPasswordCorrect = await bcryptjs.compare(password, existingUser.password)

 const token = generateToken(existingUser._id);

 if(isPasswordCorrect){
   // Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), 
    sameSite: "none",
    secure: true,
  });
}


if(existingUser && isPasswordCorrect){
    const {_id, email} = existingUser
    res.status(200).json({
        token,
        email,
        _id
    })
}else{
    res.status(400);
    throw new Error("Invalid email or password");

}
})


const getUserData = asyncHandler(async (req, res) => {
   
    const user= await User.findById(req.user._id);

    if (user) {
        res.status(200)
      res.json({
        _id: user._id,
        email: user.email,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }

});


const deleteAllUser = asyncHandler(async (req, res) => {
    try {
      const deletedUsers = await User.deleteMany({});
      
      if (deletedUsers.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "No users found to delete",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: `${deletedUsers.deletedCount} users were deleted`,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting users",
        error: error.message,
      });
    }
  });
  

  const logoutUser = asyncHandler(async (req, res) => {
  
    res.cookie("token", "", {
      path: "/",
      httpOnly: true,
      expires: new Date(0), 
      sameSite: "none",
      secure: true,
    });
  
    res.status(200).json({ message: "Logged out successfully" });
  });
  

module.exports ={
    registerUser,
    loginUser,
    getUserData,
    deleteAllUser,
    verifyOtp,
    requestOtp,
    logoutUser
}