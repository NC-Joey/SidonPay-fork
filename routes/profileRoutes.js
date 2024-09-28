const express = require ("express")
const {protect}= require('../middleware/authmiddleware')
const profileRouter = express.Router()
const { getProfile, updateProfilePic, updateProfile } = require("../controllers/profileController")


profileRouter.get('/:id', getProfile)
profileRouter.post('/profilepic/:id', updateProfilePic)
profileRouter.put('/updateprofile/:id', protect, updateProfile)
module.exports = profileRouter