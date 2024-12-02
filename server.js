const express = require("express");
const dotenv = require("dotenv").config();
const db = require("./config/db");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/authRoutes");
const profileRoute = require("./routes/profileRoutes");
const errorHandler = require("./middleware/errorhandler");
const kycRoute = require("./routes/kycRoute");
const accountRoutes = require("./routes/accountRoute");
// initialize the app
const app = express();

// connect db
db();

// middlewares
app.use(errorHandler);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
// routes
app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/kyc", kycRoute);
app.use("/api/account", accountRoutes);

app.get("/", (req, res) => {
  res.send("welcome to our server");
});
// initialize the server
app.listen(5000, () => {
  console.log("server running ");
});
