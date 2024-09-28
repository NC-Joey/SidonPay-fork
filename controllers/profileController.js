const Profile = require("../models/profile")
const asyncHandler = require("express-async-handler")
const cloudinary = require('../config/cloudinary')

const getProfile =asyncHandler(async(req,res)=>{
  const {id}= req.params
  const profile = await Profile.findById(id)
  if(profile){
    res.status(200).json(profile)
  }else{
    res.status(404);
    throw new Error('User not found');
  }
})


const updateProfilePic = asyncHandler(async(req,res)=>{
  const {id}= req.params
  const {image} = req.file
  if (!image) {
    return res.status(400).json({ message: 'No image provided' });
  }
 try {
  
const arrayBuffer = await image.arrayBuffer();
const buffer = new Uint8Array(arrayBuffer);
const imageData = Buffer.from(buffer);

const imageBase64 = imageData.toString('base64');


const result = await cloudinary.uploader.upload(
  `data:image/png;base64,${imageBase64}`,
  {
    folder: 'sidonpay',
  }
);

const imageUrl = result.secure_url;

const profile = await Profile.findById(id);

if (!profile) {
  return res.status(404).json({ message: 'Profile not found' });
}

profile.profilePic = imageUrl;
await profile.save();

res.status(200).json({
  message: 'Profile picture updated successfully',
  profile: {
    id: profile._id,
    profilePicture: profile.profilePic,
  },
});
 } catch (error) {
  console.error('Error updating profile picture:', error);

  res.status(500).json({
    message: 'Something went wrong while updating the profile picture',
    error: error.message,
  });

 }


})


const updateProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

 
  if (req.user._id.toString() !== id) {
    return res.status(403).json({ message: 'Not authorized to update this profile' });
  }

  if(!username){
    throw new Error("Please fill in all Fields")
  }

  try {

    const profile = await Profile.findOne({ user: id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

   
    if (username) profile.username = username;

    await profile.save();
    console.log(profile.username)

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: {
        id: profile._id,
        username: profile.username,
        profilePic: profile.profilePic,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      message: 'Something went wrong while updating the profile',
      error: error.message,
    });
  }
});



module.exports={
    updateProfilePic,
    getProfile,
    updateProfile
}