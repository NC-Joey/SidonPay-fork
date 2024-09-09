const express = require ("express")
const {protect} = require("../middleware/authmiddleware")
const { registerUser, loginUser, getUserProfile } = require("../controllers/userController")

const userRoute = express.Router()

userRoute.post('/register',registerUser)
userRoute.post('/login',loginUser)
userRoute.get('/',protect,getUserProfile)


module.exports = userRoute