const express = require("express")
const { verifyBVN, verifyNIN } = require("../controllers/kycController")

const kycRoute = express.Router()
kycRoute.get('/verify-bvn/:bvn', verifyBVN)
kycRoute.get('/verify-nin/:nin', verifyNIN)
module.exports = kycRoute