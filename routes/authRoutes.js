const express = require ("express")
const {protect} = require("../middleware/authmiddleware")
const { registerUser, loginUser, getUserProfile, deleteAllUser, verifyOtp, requestOtp } = require("../controllers/authController")

const authRoute = express.Router()

authRoute.post('/register',registerUser)
authRoute.delete('/all',deleteAllUser)
authRoute.post('/login',loginUser)
authRoute.post('/verify-otp',verifyOtp)
authRoute.post('/request-otp',requestOtp)
authRoute.get('/',protect,getUserProfile)


module.exports = authRoute