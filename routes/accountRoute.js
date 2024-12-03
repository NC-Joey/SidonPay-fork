const express = require("express");
const { protect } = require("../middleware/authmiddleware");
const {
  createAccount,
  deleteAllAccounts,
  getAccount,
  getCustomerFromAnchor,
  verifyCustomerFromAnchor,
  createDepositAccount,
} = require("../controllers/accountController");

const accountRoutes = express.Router();

accountRoutes.post("/create-customer", protect, createAccount);
accountRoutes.get("/", protect, getAccount);
accountRoutes.get("/customer", protect, getCustomerFromAnchor);
accountRoutes.post("/verify", protect, verifyCustomerFromAnchor);
accountRoutes.post("/create-deposit-account", protect, createDepositAccount);
accountRoutes.delete("/deleteall", deleteAllAccounts);

module.exports = accountRoutes;
