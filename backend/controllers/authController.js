const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const createVerificationToken = require("../utils/createVerificationToken");
const createPasswordResetToken = require("../utils/createPasswordResetToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
// Register customer
const registerUser = async (req, res) => {
  let createdUser = null;

  try {
    const { fullName, phone, email, password, address } = req.body;

    if (!fullName || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, phone, email, and password are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ phone }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.phone === phone
            ? "User with this phone number already exists"
            : "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rawToken, hashedToken, expires } = createVerificationToken();

    createdUser = await User.create({
      fullName,
      phone,
      email,
      password: hashedPassword,
      role: "customer",
      isPhoneVerified: false,
      isEmailVerified: false,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(expires),
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

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${rawToken}`;

    await sendEmail({
      to: createdUser.email,
      subject: "Verify your Paradise Burger email",
      text: `Please verify your email by opening this link: ${verificationUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Welcome to Paradise Burger 🍔</h2>
          <p>Hello ${createdUser.fullName},</p>
          <p>Please verify your email address to activate ordering and checkout.</p>
          <a 
            href="${verificationUrl}" 
            target="_blank"
            style="display:inline-block;padding:10px 16px;background:#d62828;color:white;text-decoration:none;border-radius:6px;"
          >
            Verify Email
          </a>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you did not create this account, please ignore this email.</p>
        </div>
      `,
    });

    const token = generateToken(createdUser._id, createdUser.role);

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
      data: {
        user: {
          id: createdUser._id,
          fullName: createdUser.fullName,
          phone: createdUser.phone,
          email: createdUser.email,
          role: createdUser.role,
          isPhoneVerified: createdUser.isPhoneVerified,
          isEmailVerified: createdUser.isEmailVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error("REGISTER EMAIL ERROR:", error);
    if (createdUser && createdUser._id) {
      await User.deleteOne({ _id: createdUser._id });
    }

    return res.status(500).json({
      success: false,
      message:
        "Registration failed. Email could not be sent, so the account was not saved. Please check email settings.",
      error: error.message,
    });
  }
};

//email verification

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token.trim())
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link",
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: "Email already verified. You can login now.",
      });
    }

    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Verification link has expired. Please resend verification email.",
      });
    }

    user.isEmailVerified = true;

    // Keep hashed token until expiry so double-click / React double-call still shows success.
    // It cannot verify another account because it belongs only to this user.
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can login now.",
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Email verification failed",
      error: error.message,
    });
  }
};
//resendVerificationEmai
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "This email is already verified",
      });
    }

    const { rawToken, hashedToken, expires } = createVerificationToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(expires);

    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your Paradise Burger email",
      text: `Please verify your email by opening this link: ${verificationUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Paradise Burger Email Verification 🍔</h2>
          <p>Hello ${user.fullName},</p>
          <p>You requested a new email verification link.</p>
          <a 
            href="${verificationUrl}" 
            target="_blank"
            style="display:inline-block;padding:10px 16px;background:#d62828;color:white;text-decoration:none;border-radius:6px;"
          >
            Verify Email
          </a>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Verification email sent again. Please check your inbox.",
    });
  } catch (error) {
    console.error("RESEND VERIFICATION EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend verification email",
      error: error.message,
    });
  }
};
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is disabled",
      });
    }

    const { rawToken, hashedToken, expires } = createPasswordResetToken();

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(expires);

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your Paradise Burger password",
      text: `Reset your password by opening this link: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Paradise Burger Password Reset 🍔</h2>
          <p>Hello ${user.fullName},</p>
          <p>You requested to reset your password.</p>
          <a
            href="${resetUrl}"
            target="_blank"
            style="display:inline-block;padding:10px 16px;background:#d62828;color:white;text-decoration:none;border-radius:6px;"
          >
            Reset Password
          </a>
          <p>This password reset link will expire in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link sent. Please check your email.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send password reset email",
      error: error.message,
    });
  }
};

//resetPassword

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters and include one uppercase letter and one special character",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token.trim())
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can login now.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};
// Login user
const loginUser = async (req, res) => {
  try {
    const { phone, email, identifier, password } = req.body;

    const loginId = identifier || phone || email;

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone/email and password are required",
      });
    }

    const cleanLoginId = loginId.trim();
   
    const user = await User.findOne({
      $or: [
        { phone: cleanLoginId },
        { email: cleanLoginId.toLowerCase() },
      ],
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone/email or password",
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
        message: "Invalid phone/email or password",
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
          isEmailVerified: user.isEmailVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

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
  verifyEmail,
  resendVerificationEmail,
   forgotPassword,
   resetPassword,
  loginUser,
  getProfile,
  changePassword,
};