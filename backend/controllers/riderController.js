const bcrypt = require("bcryptjs");
const User = require("../models/User");
const RiderProfile = require("../models/RiderProfile");
const Order = require("../models/Order");

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
      isActive: true,
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

    if (!riderProfile.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your rider account is inactive. Contact admin.",
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

// Rider: Get assigned orders
const getAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ assignedRider: req.user._id })
      .populate("customer", "fullName phone email")
      .populate("items.menuItem", "name imageUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Assigned orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned orders",
      error: error.message,
    });
  }
};

// Rider: Mark order as picked up
const markOrderPickedUp = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      !order.assignedRider ||
      order.assignedRider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "This order is not assigned to you",
      });
    }

    if (order.orderStatus !== "Assigned to Rider") {
      return res.status(400).json({
        success: false,
        message: "Only assigned orders can be picked up",
      });
    }

    order.orderStatus = "Picked Up";
    order.pickedUpAt = new Date();

    order.statusHistory.push({
      status: "Picked Up",
      changedBy: req.user._id,
      note: "Order picked up by rider",
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order marked as picked up",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update pickup status",
      error: error.message,
    });
  }
};

// Rider: Mark order as out for delivery
const markOrderOutForDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      !order.assignedRider ||
      order.assignedRider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "This order is not assigned to you",
      });
    }

    if (order.orderStatus !== "Picked Up") {
      return res.status(400).json({
        success: false,
        message: "Only picked up orders can be marked out for delivery",
      });
    }

    order.orderStatus = "Out for Delivery";

    order.statusHistory.push({
      status: "Out for Delivery",
      changedBy: req.user._id,
      note: "Order is out for delivery",
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order marked as out for delivery",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update delivery status",
      error: error.message,
    });
  }
};

// Rider: Mark order as delivered
const markOrderDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      !order.assignedRider ||
      order.assignedRider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "This order is not assigned to you",
      });
    }

    if (
      order.orderStatus !== "Out for Delivery" &&
      order.orderStatus !== "Picked Up"
    ) {
      return res.status(400).json({
        success: false,
        message: "Only picked up or out for delivery orders can be delivered",
      });
    }

    order.orderStatus = "Delivered";
    order.deliveredAt = new Date();

    order.statusHistory.push({
      status: "Delivered",
      changedBy: req.user._id,
      note: "Order delivered by rider",
    });

    const riderProfile = await RiderProfile.findOne({ user: req.user._id });

    if (riderProfile) {
      riderProfile.totalCompletedDeliveries += 1;
      riderProfile.isAvailable = true;
      await riderProfile.save();
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order marked as delivered",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark order as delivered",
      error: error.message,
    });
  }
};

// Rider: Mark order as failed delivery
const markOrderFailed = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      !order.assignedRider ||
      order.assignedRider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "This order is not assigned to you",
      });
    }

    order.orderStatus = "Failed Delivery";

    order.statusHistory.push({
      status: "Failed Delivery",
      changedBy: req.user._id,
      note: reason || "Delivery failed",
    });

    const riderProfile = await RiderProfile.findOne({ user: req.user._id });

    if (riderProfile) {
      riderProfile.totalFailedDeliveries += 1;
      riderProfile.isAvailable = true;
      await riderProfile.save();
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order marked as failed delivery",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark order as failed",
      error: error.message,
    });
  }
};

// Admin: Deactivate rider
const deactivateRider = async (req, res) => {
  try {
    const riderProfile = await RiderProfile.findById(req.params.id).populate(
      "user",
      "fullName phone email role isActive"
    );

    if (!riderProfile) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    riderProfile.isActive = false;
    riderProfile.isAvailable = false;

    if (riderProfile.user) {
      riderProfile.user.isActive = false;
      await riderProfile.user.save();
    }

    await riderProfile.save();

    return res.status(200).json({
      success: true,
      message: "Rider deactivated successfully",
      data: riderProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate rider",
      error: error.message,
    });
  }
};

// Admin: Activate rider
const activateRider = async (req, res) => {
  try {
    const riderProfile = await RiderProfile.findById(req.params.id).populate(
      "user",
      "fullName phone email role isActive"
    );

    if (!riderProfile) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    riderProfile.isActive = true;

    if (riderProfile.user) {
      riderProfile.user.isActive = true;
      await riderProfile.user.save();
    }

    await riderProfile.save();

    return res.status(200).json({
      success: true,
      message: "Rider activated successfully",
      data: riderProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to activate rider",
      error: error.message,
    });
  }
};

module.exports = {
  createRider,
  getAllRiders,
  updateRiderAvailability,
  getMyRiderProfile,
  getAssignedOrders,
  markOrderPickedUp,
  markOrderOutForDelivery,
  markOrderDelivered,
  markOrderFailed,
  deactivateRider,
  activateRider,
};