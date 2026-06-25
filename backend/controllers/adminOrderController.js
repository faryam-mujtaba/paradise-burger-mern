const Order = require("../models/Order");

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
      .populate("items.deal", "title image dealPrice")
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
      .populate("items.deal", "title image dealPrice");

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
      "Accepted",
      "Preparing",
      "Ready",
      "Delivered",
      "Cancelled",
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

    if (["Rejected", "Cancelled", "Delivered"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order is already ${order.orderStatus}`,
      });
    }

    order.orderStatus = status;

    if (status === "Accepted") {
      order.acceptedAt = order.acceptedAt || new Date();
    }

    if (status === "Ready") {
      order.preparedAt = new Date();
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

module.exports = {
  getAllOrders,
  getAdminOrderById,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
};