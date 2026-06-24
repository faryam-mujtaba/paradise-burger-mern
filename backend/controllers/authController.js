const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Register customer
const registerUser = async (req, res) => {
    try {
        const { fullName, phone, email, password, address } = req.body;

        if (!fullName || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Full name, phone, and password are required",
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

        const user = await User.create({
            fullName,
            phone,
            email,
            password: hashedPassword,
            role: "customer",
            isPhoneVerified: false,
            addresses: address
                ? [
                    {
                        label: address.label || "Home",
                        addressLine: address.addressLine,
                        city: address.city,
                        area: address.area,
                        isDefault: true,
                    },
                ]
                : [],
        });

        const token = generateToken(user._id, user.role);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    phone: user.phone,
                    email: user.email,
                    role: user.role,
                    isPhoneVerified: user.isPhoneVerified,
                },
                token,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message,
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Phone and password are required",
            });
        }

        const user = await User.findOne({ phone });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid phone or password",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is disabled",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid phone or password",
            });
        }

        const token = generateToken(user._id, user.role);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    phone: user.phone,
                    email: user.email,
                    role: user.role,
                    isPhoneVerified: user.isPhoneVerified,
                },
                token,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
};
const getProfile = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: {
                user: req.user,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
            error: error.message,
        });
    }
};
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

if (!passwordRegex.test(newPassword)) {
  return res.status(400).json({
    success: false,
    message:
      "New password must be at least 6 characters and include one uppercase letter and one special character",
  });
}
    

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};
module.exports = {
    registerUser,
    loginUser,
    getProfile,
    changePassword,
};