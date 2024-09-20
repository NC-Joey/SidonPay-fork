const express = require ("express")
const profileRouter = express.Router()
const { getProfile, updateProfilePic } = require("../controllers/profileController")


profileRouter.get('/:id', getProfile)
profileRouter.post('/profilepic/:id', updateProfilePic)
module.exports = profileRouter