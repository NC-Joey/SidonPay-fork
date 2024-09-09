const User = require ('../models/user')
const bcryptjs = require('bcryptjs')
const asyncHandler = require("express-async-handler")
const generateToken = require("../utils/generateToken")
const registerUser = asyncHandler(async(req,res)=>{
 const {username,email,password}= req.body

if(!username  || !email || !password){
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
    username,
    email,
    password:hashedPassword
})

if (user) {
    res.status(201).json({
        _id: user._id,
        username: user.username,
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
      res.json({
        _id: user._id,
        username: user.username,
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