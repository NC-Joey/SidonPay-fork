const User = require ('../models/user')
const Profile = require ("../models/profile")
const bcryptjs = require('bcryptjs')
const asyncHandler = require("express-async-handler")
const generateToken = require("../utils/generateToken")
const {createUserName} = require("../utils/generateUsername")
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
const user = await User.create({
     firstName,
     lastName,
     phoneNumber,
    email,
    password:hashedPassword
})

const profile = await  new Profile({
    user: user._id,
    username : createUserName(user.firstName)
})

await profile.save()

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


const getUserProfile = asyncHandler(async (req, res) => {
   
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

module.exports ={
    registerUser,
    loginUser,
    getUserProfile
}