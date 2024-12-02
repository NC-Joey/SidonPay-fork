const express = require("express");
const { protect } = require("../middleware/authmiddleware");
const {
  createAccount,
  deleteAllAccounts,
  getAccount,
  getCustomerFromAnchor,
} = require("../controllers/accountController");

const accountRoutes = express.Router();

accountRoutes.post("/create-customer", protect, createAccount);
accountRoutes.get("/", protect, getAccount);
accountRoutes.get("/customer", protect, getCustomerFromAnchor);
accountRoutes.delete("/deleteall", deleteAllAccounts);

module.exports = accountRoutes;
