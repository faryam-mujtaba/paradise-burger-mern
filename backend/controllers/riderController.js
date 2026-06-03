const bcrypt = require("bcryptjs");
const User = require("../models/User");
const RiderProfile = require("../models/RiderProfile");

// Admin: Create rider
const createRider = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      password,
      bikeType,
      bikeNumberPlate,
      behaviorNotes,
    } = req.body;

    if (!fullName || !phone || !password || !bikeType || !bikeNumberPlate) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, phone, password, bike type, and bike number plate are required",
      });
    }

    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this phone number already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const riderUser = await User.create({
      fullName,
      phone,
      email,
      password: hashedPassword,
      role: "rider",
      isPhoneVerified: true,
      isActive: true,
    });

    const riderProfile = await RiderProfile.create({
      user: riderUser._id,
      phone,
      bikeType,
      bikeNumberPlate,
      behaviorNotes: behaviorNotes || "",
      isAvailable: false,
    });

    return res.status(201).json({
      success: true,
      message: "Rider created successfully",
      data: {
        user: {
          id: riderUser._id,
          fullName: riderUser.fullName,
          phone: riderUser.phone,
          email: riderUser.email,
          role: riderUser.role,
        },
        riderProfile,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create rider",
      error: error.message,
    });
  }
};

// Admin: Get all riders
const getAllRiders = async (req, res) => {
  try {
    const riders = await RiderProfile.find()
      .populate("user", "fullName phone email role isActive")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Riders fetched successfully",
      data: riders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch riders",
      error: error.message,
    });
  }
};

// Rider: Update own availability
const updateRiderAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be true or false",
      });
    }

    const riderProfile = await RiderProfile.findOne({ user: req.user._id });

    if (!riderProfile) {
      return res.status(404).json({
        success: false,
        message: "Rider profile not found",
      });
    }

    riderProfile.isAvailable = isAvailable;

    if (isAvailable) {
      riderProfile.availabilityCount += 1;
    }

    await riderProfile.save();

    return res.status(200).json({
      success: true,
      message: "Rider availability updated successfully",
      data: riderProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update rider availability",
      error: error.message,
    });
  }
};

// Rider: Get own rider profile
const getMyRiderProfile = async (req, res) => {
  try {
    const riderProfile = await RiderProfile.findOne({ user: req.user._id })
      .populate("user", "fullName phone email role isActive");

    if (!riderProfile) {
      return res.status(404).json({
        success: false,
        message: "Rider profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rider profile fetched successfully",
      data: riderProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rider profile",
      error: error.message,
    });
  }
};
module.exports = {
  createRider,
  getAllRiders,
  updateRiderAvailability,
  getMyRiderProfile,
};