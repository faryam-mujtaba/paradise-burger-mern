const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dns = require("dns");
require("dotenv").config();

const User = require("../models/User");

// Fix for some WiFi/router DNS issues with MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected for admin seeder");

    const existingAdmin = await User.findOne({ phone: "03000000000" });

    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      fullName: "Paradise Burger Admin",
      phone: "03000000000",
      email: "admin@paradiseburger.com",
      password: hashedPassword,
      role: "admin",
      isPhoneVerified: true,
      isActive: true,
    });

    console.log("Admin user created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Admin seeder failed:", error.message);
    process.exit(1);
  }
};

createAdmin();