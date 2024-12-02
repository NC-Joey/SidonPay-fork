const express = require("express");
const { verifyBVN, verifyNIN } = require("../controllers/kycController");
const { protect } = require("../middleware/authmiddleware");
const { createAccount } = require("../controllers/accountController");

const kycRoute = express.Router();
kycRoute.get("/verify-bvn/:bvn", protect, verifyBVN);
kycRoute.get("/verify-nin/:nin", protect, verifyNIN);
kycRoute.post("/create", createAccount);
module.exports = kycRoute;
