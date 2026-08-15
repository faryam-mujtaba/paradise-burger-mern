const User = require("../models/User");

const getCurrentUserId = (req) => {
  return req.user?._id || req.user?.id;
};

const cleanText = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

// GET /api/profile/me
const getMyProfile = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      data: user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
      error: error.message,
    });
  }
};

// PUT /api/profile/me
const updateMyProfile = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);

    const {
      fullName,
      phone,
      email,
      addressLine,
      city,
      area,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    const cleanedFullName = cleanText(fullName);
    const cleanedPhone = cleanText(phone);
    const cleanedEmail = cleanText(email).toLowerCase();
    const cleanedAddressLine = cleanText(addressLine);
    const cleanedCity = cleanText(city);
    const cleanedArea = cleanText(area);

    if (!cleanedFullName || cleanedFullName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Full name must contain at least 2 characters.",
      });
    }

    if (!cleanedPhone || cleanedPhone.length < 7) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number.",
      });
    }

    const existingPhoneUser = await User.findOne({
      phone: cleanedPhone,
      _id: { $ne: userId },
    });

    if (existingPhoneUser) {
      return res.status(409).json({
        success: false,
        message: "This phone number is already being used.",
      });
    }

    if (cleanedEmail) {
      const existingEmailUser = await User.findOne({
        email: cleanedEmail,
        _id: { $ne: userId },
      });

      if (existingEmailUser) {
        return res.status(409).json({
          success: false,
          message: "This email address is already being used.",
        });
      }
    }

    const oldEmail = user.email?.toLowerCase() || "";
    const emailChanged = oldEmail !== cleanedEmail;

    user.fullName = cleanedFullName;
    user.phone = cleanedPhone;
    user.email = cleanedEmail || undefined;

    // New email must be verified again.
    if (emailChanged) {
      user.isEmailVerified = false;
    }

    // Address editing is only needed for customers.
    if (user.role === "customer") {
      const hasAddressInput =
        cleanedAddressLine || cleanedCity || cleanedArea;

      if (hasAddressInput) {
        if (!cleanedAddressLine || cleanedAddressLine.length < 8) {
          return res.status(400).json({
            success: false,
            message: "Address must contain at least 8 characters.",
          });
        }

        if (!cleanedCity || cleanedCity.length < 2) {
          return res.status(400).json({
            success: false,
            message: "Please enter a valid city.",
          });
        }

        if (!cleanedArea || cleanedArea.length < 2) {
          return res.status(400).json({
            success: false,
            message: "Please enter a valid area.",
          });
        }

        if (!Array.isArray(user.addresses)) {
          user.addresses = [];
        }

        let defaultAddressIndex = user.addresses.findIndex(
          (address) => address.isDefault
        );

        if (defaultAddressIndex === -1 && user.addresses.length > 0) {
          defaultAddressIndex = 0;
        }

        const updatedAddress = {
          label: "Home",
          addressLine: cleanedAddressLine,
          city: cleanedCity,
          area: cleanedArea,
          isDefault: true,
        };

        user.addresses.forEach((address) => {
          address.isDefault = false;
        });

        if (defaultAddressIndex >= 0) {
          user.addresses[defaultAddressIndex] = updatedAddress;
        } else {
          user.addresses.push(updatedAddress);
        }
      }
    }

    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      success: true,
      message: emailChanged
        ? "Profile updated. Please verify your new email address."
        : "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      return res.status(409).json({
        success: false,
        message:
          duplicateField === "email"
            ? "This email address is already being used."
            : "This phone number is already being used.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};