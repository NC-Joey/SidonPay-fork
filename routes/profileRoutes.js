const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authmiddleware");
const profileRouter = express.Router();
const {
  getProfile,
  updateProfilePic,
  updateProfile,
} = require("../controllers/profileController");

const upload = multer({ dest: "uploads/" });

profileRouter.get("/:id", getProfile);
profileRouter.put(
  "/profilepic/:id",
  protect,
  upload.single("image"),
  updateProfilePic
);
profileRouter.put("/updateprofile/:id", protect, updateProfile);
module.exports = profileRouter;
