const express = require("express")
const dotenv = require("dotenv").config()
const db = require('./config/db')
const userRoute = require("./routes/userRoutes")

// initialize the app
const app = express()


// connect db 
db()


// routes
app.use('/api/user', userRoute)

// initialize the server 
app.listen(5000, ()=>{
    console.log("server running ")
})