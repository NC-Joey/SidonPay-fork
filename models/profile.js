const mongoose = require("mongoose");

const Profile = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default:
        "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Profile", Profile);
