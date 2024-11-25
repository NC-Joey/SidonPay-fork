const express = require("express")
const { verifyBVN, verifyNIN } = require("../controllers/kycController")
const { createAccount } = require("../controllers/accountController")

const kycRoute = express.Router()
kycRoute.get('/verify-bvn/:bvn', verifyBVN)
kycRoute.get('/verify-nin/:nin', verifyNIN)
kycRoute.post('/create', createAccount)
module.exports = kycRoute