const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const phone = "03000000001";
    const newPassword = "Subadmin@123";

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findOneAndUpdate(
      { phone },
      {
        password: hashedPassword,
        role: "subadmin",
        isEmailVerified: true,
        isActive: true,
      },
      { new: true }
    );

    if (!user) {
      console.log("User not found");
      process.exit(1);
    }

    console.log("Subadmin password reset successfully");
    console.log("Phone:", phone);
    console.log("New Password:", newPassword);

    process.exit(0);
  } catch (error) {
    console.error("Reset failed:", error.message);
    process.exit(1);
  }
};

resetPassword();