const express = require ("express")
const {protect} = require("../middleware/authmiddleware")
const { registerUser, loginUser, getUserData, deleteAllUser, verifyOtp, requestOtp, logoutUser } = require("../controllers/authController")

const authRoute = express.Router()

authRoute.post('/register',registerUser)
authRoute.delete('/all',deleteAllUser)
authRoute.post('/login',loginUser)
authRoute.post('/logout',logoutUser)
authRoute.post('/verify-otp',verifyOtp)
authRoute.post('/request-otp',requestOtp)
authRoute.get('/',protect,getUserData)


module.exports = authRoute