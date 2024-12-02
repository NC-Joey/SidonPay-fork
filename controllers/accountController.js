const axios = require("axios");
const asyncHandler = require("express-async-handler");
const Account = require("../models/account");
const User = require("../models/user");
const BASE_URL = process.env.ANCHOR_URL;
const apiKey = process.env.ANCHOR_API;

const createAccount = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    middleName,
    email,
    phoneNumber,
    addressLine_1,
    addressLine_2,
    city,
    state,
    postalCode,
    dateOfBirth,
    bvn,
    gender,
    selfieImage,
    description,
    doingBusinessAs,

    isSoleProprietor,
  } = req.body;

  // Validate that the user exists and is verified
  const user = await User.findById(req.user._id);
  if (!user || !user.isVerified) {
    return res.status(404).json({
      message: "User not found or User not Verified",
    });
  }

  if (user.account) {
    return res.status(401).json({
      message: "User  already have an account",
    });
  }

  try {
    // Construct request payload
    const payload = {
      data: {
        type: "IndividualCustomer",
        attributes: {
          fullName: {
            firstName,
            lastName,
            middleName,
          },
          email,
          phoneNumber,
          address: {
            addressLine_1,
            addressLine_2,
            city,
            state,
            postalCode,
            country: "NG",
          },
          identificationLevel2: {
            dateOfBirth,
            gender,
            bvn,
            selfieImage: selfieImage || null,
          },
          isSoleProprietor,
          description,
          doingBusinessAs,
        },
      },
    };

    // Make API request
    const response = await axios.post(`${BASE_URL}/api/v1/customers`, payload, {
      headers: {
        "Content-Type": "application/json",
        "x-anchor-key": apiKey,
      },
    });

    // Handle success

    // save customer_id
    const account = new Account({
      user: req.user._id,
      customer_id: response.data.data.id,
    });
    await account.save();

    res.status(201).json({
      message: "Account created successfully",
      data: response.data,
      customer_id: response.data.data.id,
    });
  } catch (error) {
    console.error(
      "Error creating account:",
      error.response?.data || error.message || error
    );
    res.status(500).json({
      message: "Failed to create account",
      error: error.response?.data || error.message || "Unknown error occurred",
    });
  }
});

const deleteAllAccounts = asyncHandler(async (req, res) => {
  try {
    const deleteAccounts = await Account.deleteMany({});
    return res.status(200).json({
      message: "Accounts Deleted",
    });
  } catch (error) {
    console.log(error);
  }
});

const getAccount = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const findUserAccount = await Account.findOne({
      user: userId,
    }).populate({ path: "user", select: "-password" });

    if (!findUserAccount) {
      return res.status(404).json({
        message: "No account found for the user",
      });
    }

    res.status(200).json({
      message: "Account retrieved successfully",
      account: findUserAccount,
    });
  } catch (error) {
    console.error("Error retrieving account:", error.message);

    res.status(500).json({
      message: "Failed to retrieve account",
      error: error.message,
    });
  }
});

const getCustomerFromAnchor = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const getUser = await User.findOne({
      _id: userId,
    });

    if (!getUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const customer_id = getUser.customer_id;

    // Make API request
    const response = await axios.get(
      `${BASE_URL}/api/v1/customers/${customer_id}?include=IndividualCustomer`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-anchor-key": apiKey,
        },
      }
    );

    res.status(200).json({
      message: "Customer Fetched  successfully",
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Error getting account:",
      error.response?.data || error.message || error
    );
    res.status(500).json({
      message: "Failed to get account",
      error: error.response?.data || error.message || "Unknown error occurred",
    });
  }
});

const verifyCustomerFromAnchor = asyncHandler(async (req, res) => {});

module.exports = {
  createAccount,
  deleteAllAccounts,
  getCustomerFromAnchor,
  verifyCustomerFromAnchor,
  getAccount,
};
