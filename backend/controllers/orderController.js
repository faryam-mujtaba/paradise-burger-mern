const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");

// Customer: Place order
const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, specialInstructions } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    if (
      !deliveryAddress ||
      !deliveryAddress.addressLine ||
      !deliveryAddress.city ||
      !deliveryAddress.area
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete delivery address is required",
      });
    }

    const customerId = req.user?._id || req.user?.id;

    const customer = await User.findById(customerId).select(
      "role isEmailVerified"
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (customer.role === "customer" && !customer.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before placing an order",
      });
    }

    let orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);

      if (!menuItem || !menuItem.isAvailable) {
        return res.status(404).json({
          success: false,
          message: "One or more menu items are not available",
        });
      }

      const quantity = Number(item.quantity);

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Item quantity must be at least 1",
        });
      }

      const finalPrice =
        menuItem.discountPrice && menuItem.discountPrice > 0
          ? menuItem.discountPrice
          : menuItem.price;

      subtotal += finalPrice * quantity;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: finalPrice,
        quantity,
      });
    }

    const deliveryFee = 100;
    const totalAmount = subtotal + deliveryFee;

    const order = await Order.create({
      customer: req.user._id,
      customerSnapshot: {
        fullName: req.user.fullName,
        phone: req.user.phone,
        email: req.user.email,
      },
      items: orderItems,
      deliveryAddress,
      specialInstructions,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pending",
      orderStatus: "Pending",
      statusHistory: [
        {
          status: "Pending",
          changedBy: req.user._id,
          note: "Order placed by customer",
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: error.message,
    });
  }
};

// Customer: Get my orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("items.menuItem", "name image")
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

// Customer/Admin: Get single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.menuItem",
      "name image"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isOrderOwner = order.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOrderOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
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

// Customer: Cancel order before admin accepts
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (order.orderStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled after admin accepts it",
      });
    }

    order.orderStatus = "Cancelled";

    order.statusHistory.push({
      status: "Cancelled",
      changedBy: req.user._id,
      note: "Order cancelled by customer",
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};