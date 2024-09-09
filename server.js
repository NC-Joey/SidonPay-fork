const express = require("express")
const dotenv = require("dotenv").config()
const db = require('./config/db')
const cookieParser = require("cookie-parser")
const userRoute = require("./routes/userRoutes")
const errorHandler = require('./middleware/errorhandler')
// initialize the app
const app = express()


// connect db 
db()

// middlewares
app.use(errorHandler)
app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))
app.use(cookieParser())
// routes
app.use('/api/user', userRoute)

// initialize the server 
app.listen(5000, ()=>{
    console.log("server running ")
})