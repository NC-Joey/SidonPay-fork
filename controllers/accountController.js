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
    // Validate if the user is authenticated and has an ID
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const userId = req.user._id;

    // Fetch the account associated with the user
    const findUserAccount = await Account.findOne({ user: userId }).populate({
      path: "user",
      select: "-password", // Exclude password field from populated data
    });

    if (!findUserAccount) {
      return res
        .status(404)
        .json({ message: "Account not found for the user" });
    }

    // Check if customer_id exists for the account
    const customerId = findUserAccount.customer_id;
    if (!customerId) {
      return res
        .status(404)
        .json({ message: "Customer ID not found for the account" });
    }

    // Ensure the API key is available
    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "Server error: API Key is missing" });
    }

    // Make the API request to fetch customer details
    const response = await axios.get(
      `${BASE_URL}/api/v1/customers/${customerId}?include=IndividualCustomer`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-anchor-key": apiKey,
        },
      }
    );

    // Ensure the response contains expected data
    if (!response.data || !response.data.data) {
      return res
        .status(500)
        .json({ message: "Invalid response from Anchor API" });
    }

    // Respond with the fetched customer details
    res.status(200).json({
      message: "Customer fetched successfully",
      data: response.data,
    });
  } catch (error) {
    // Extract error details for logging and response
    const errorData = error.response?.data || {
      message: error.message || "Unknown error",
    };
    console.error("Error fetching customer details:", errorData);

    res.status(500).json({
      message: "Failed to fetch customer details",
      error: errorData,
    });
  }
});

const verifyCustomerFromAnchor = asyncHandler(async (req, res) => {
  const { bvn, selfie, dateOfBirth, gender, level } = req.body;

  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const userId = req.user._id;

    // Fetch the account associated with the user
    const findUserAccount = await Account.findOne({ user: userId }).populate({
      path: "user",
      select: "-password", // Exclude password field from populated data
    });

    if (!findUserAccount) {
      return res
        .status(404)
        .json({ message: "Account not found for the user" });
    }

    // Check if customer_id exists for the account
    const customerId = findUserAccount.customer_id;
    if (!customerId) {
      return res
        .status(404)
        .json({ message: "Customer ID not found for the account" });
    }

    // Ensure the API key is available
    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "Server error: API Key is missing" });
    }

    const payload = {
      data: {
        attributes: {
          level: level,
          bvn,
          selfie,
          dateOfBirth,
          gender,
        },
        type: "Verification",
      },
    };

    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "x-anchor-key": apiKey,
    };

    // Make the API request
    const url = `https://api.sandbox.getanchor.co/api/v1/customers/${customerId}/verification/individual`;

    const response = await axios.post(url, payload, { headers });

    // Handle successful response
    res.status(200).json({
      message: "Customer verified successfully",
      data: response.data,
    });
  } catch (error) {
    const errorData = error.response?.data || {
      message: error.message || "Unknown error occurred",
    };
    console.error("Error verifying customer:", errorData);

    res.status(500).json({
      message: "Failed to verify customer",
      error: errorData,
    });
  }
});

const createDepositAccount = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const userId = req.user._id;

    // Fetch the account associated with the user
    const findUserAccount = await Account.findOne({ user: userId }).populate({
      path: "user",
      select: "-password", // Exclude password field from populated data
    });

    if (!findUserAccount) {
      return res
        .status(404)
        .json({ message: "Account not found for the user" });
    }

    // Check if customer_id exists for the account
    const customerId = findUserAccount.customer_id;
    if (!customerId) {
      return res
        .status(404)
        .json({ message: "Customer ID not found for the account" });
    }

    // Ensure the API key is available
    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "Server error: API Key is missing" });
    }

    const payload = {
      data: {
        attributes: {
          productName: "SAVINGS",
        },
        relationships: {
          customer: {
            data: {
              type: "IndividualAccount",
              id: customerId,
            },
          },
        },
        type: "DepositAccount",
      },
    };

    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "x-anchor-key": apiKey,
    };

    // Make API request to create deposit account
    const response = await axios.post(
      "https://api.sandbox.getanchor.co/api/v1/accounts",
      payload,
      { headers }
    );

    const responseData = response.data?.data;

    if (!responseData) {
      return res
        .status(500)
        .json({ message: "Failed to retrieve deposit account data" });
    }

    // Save the deposit account details into the Account schema
    findUserAccount.depositAccount = {
      id: responseData.id,
      type: responseData.type,
      attributes: {
        createdAt: responseData.attributes.createdAt,
        bank: responseData.attributes.bank,
        accountName: responseData.attributes.accountName,
        frozen: responseData.attributes.frozen,
        currency: responseData.attributes.currency,
        accountNumber: responseData.attributes.accountNumber,
        type: responseData.attributes.type,
        status: responseData.attributes.status,
      },
      relationships: {
        accountNumbers: responseData.relationships.accountNumbers?.data || [],
        subAccounts: responseData.relationships.subAccounts?.data || [],
        virtualNubans: responseData.relationships.virtualNubans?.data || [],
        customer: responseData.relationships.customer?.data || null,
      },
    };

    await findUserAccount.save();

    res.status(201).json({
      message: "Deposit account created successfully",
      data: findUserAccount.depositAccount,
    });
  } catch (error) {
    console.error(
      "Error creating deposit account:",
      error.response?.data || error.message || error
    );
    res.status(500).json({
      message: "Failed to create deposit account",
      error: error.response?.data || error.message || "Unknown error occurred",
    });
  }
});

module.exports = {
  createAccount,
  deleteAllAccounts,
  getCustomerFromAnchor,
  verifyCustomerFromAnchor,
  getAccount,
  createDepositAccount,
};
