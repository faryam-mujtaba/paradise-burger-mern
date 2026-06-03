const Order = require("../models/Order");
const RiderProfile = require("../models/RiderProfile");
const User = require("../models/User");
// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status) {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter)
      .populate("customer", "fullName phone email")
      .populate("items.menuItem", "name image")
      .populate("assignedRider", "fullName phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Admin: Get single order
const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "fullName phone email")
      .populate("items.menuItem", "name image")
      .populate("assignedRider", "fullName phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// Admin: Accept order
const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be accepted",
      });
    }

    order.orderStatus = "Accepted";
    order.acceptedAt = new Date();

    order.statusHistory.push({
      status: "Accepted",
      changedBy: req.user._id,
      note: "Order accepted by admin",
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order accepted successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to accept order",
      error: error.message,
    });
  }
};

// Admin: Reject order
const rejectOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be rejected",
      });
    }

    order.orderStatus = "Rejected";

    order.statusHistory.push({
      status: "Rejected",
      changedBy: req.user._id,
      note: reason || "Order rejected by admin",
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order rejected successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reject order",
      error: error.message,
    });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const allowedStatuses = [
      "Preparing",
      "Ready",
      "Assigned to Rider",
      "Picked Up",
      "Out for Delivery",
      "Delivered",
      "Failed Delivery",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = status;

    if (status === "Preparing") {
      order.preparedAt = undefined;
    }

    if (status === "Ready") {
      order.preparedAt = new Date();
    }

    if (status === "Picked Up") {
      order.pickedUpAt = new Date();
    }

    if (status === "Delivered") {
      order.deliveredAt = new Date();
    }

    order.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: note || `Order status updated to ${status}`,
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
// Admin: Assign ready order to rider
const assignOrderToRider = async (req, res) => {
  try {
    const { riderId } = req.body;

    if (!riderId) {
      return res.status(400).json({
        success: false,
        message: "Rider ID is required",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "Ready") {
      return res.status(400).json({
        success: false,
        message: "Only ready orders can be assigned to riders",
      });
    }

    const riderUser = await User.findById(riderId);

    if (!riderUser || riderUser.role !== "rider") {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    const riderProfile = await RiderProfile.findOne({ user: riderId });

    if (!riderProfile) {
      return res.status(404).json({
        success: false,
        message: "Rider profile not found",
      });
    }

    if (!riderProfile.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Rider is not available",
      });
    }

    order.assignedRider = riderId;
    order.orderStatus = "Assigned to Rider";

    order.statusHistory.push({
      status: "Assigned to Rider",
      changedBy: req.user._id,
      note: `Order assigned to rider ${riderUser.fullName}`,
    });

    riderProfile.totalAssignedOrders += 1;
    riderProfile.isAvailable = false;

    await order.save();
    await riderProfile.save();

    return res.status(200).json({
      success: true,
      message: "Order assigned to rider successfully",
      data: {
        order,
        riderProfile,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to assign order to rider",
      error: error.message,
    });
  }
};
module.exports = {
  getAllOrders,
  getAdminOrderById,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  assignOrderToRider,
};