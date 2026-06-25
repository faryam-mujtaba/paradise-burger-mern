const express = require("express");
const {
  registerUser,
   verifyEmail,
  loginUser,
  getProfile,
  changePassword,
} = require("../controllers/authController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.put("/change-password", protect, changePassword);
module.exports = router;