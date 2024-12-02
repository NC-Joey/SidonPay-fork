const mongoose = require("mongoose");

const userModel = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: { type: String },
    otpExpires: { type: Date },
    bvn: { type: String, unique: true },
    nin: { type: String, unique: true },
    isNinVerified: {
      type: Boolean,
      default: false,
    },
    isBvnVerified: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userModel);
