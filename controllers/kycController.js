const { default: axios } = require("axios");
const asyncHandler = require("express-async-handler");
const appId = process.env.SANDBOX_APPID;
const User = require("../models/user");
const private = process.env.SANDBOX_PRIVATE_KEY;
const baseUrl = "https://sandbox.dojah.io";

const verifyBVNData = async (bvn) => {
  const response = await axios.get(`${baseUrl}/api/v1/kyc/bvn/full`, {
    params: { bvn },
    headers: {
      AppId: appId,
      Authorization: private,
    },
  });
  try {
    console.log("Dojah API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error verifying BVN:", error.message);
    throw new Error("Failed to verify BVN");
  }
};

const verifyBVN = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      message: "User Not Found",
    });
  }

  const { bvn } = req.params;
  console.log(bvn);
  try {
    const verificationData = await verifyBVNData(bvn);
    user.bvn = bvn;
    user.isBvnVerified = true;
    await user.save();
    res.status(200).json(verificationData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

const verifyNINData = async (nin) => {
  const response = await axios.get(`${baseUrl}/api/v1/kyc/nin`, {
    params: { nin },
    headers: {
      AppId: appId,
      Authorization: private,
    },
  });
  try {
    console.log("Dojah API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error verifying nin:", error.message);
    throw new Error("Failed to verify nin");
  }
};

const verifyNIN = asyncHandler(async (req, res) => {
  const { nin } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      message: "User Not Found",
    });
  }
  console.log(nin);
  try {
    const verificationData = await verifyNINData(nin);
    user.nin = nin;
    user.isNinVerified = true;
    await user.save();
    res.status(200).json(verificationData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  verifyBVN,
  verifyNIN,
};
