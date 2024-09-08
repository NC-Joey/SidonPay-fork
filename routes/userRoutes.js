const express = require ("express")
const { registerUser, loginUser, getUserProfile } = require("../controllers/userController")

const userRoute = express.Router()

userRoute.post('/register',registerUser)
userRoute.post('/login',loginUser)
userRoute.get('/',getUserProfile)


module.exports = userRoute