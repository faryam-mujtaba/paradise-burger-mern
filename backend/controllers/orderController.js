const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Deal = require("../models/Deal");
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

    if (items.length > 20) {
      return res.status(400).json({
        success: false,
        message: "You cannot order more than 20 different items at once",
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

    const addressLine = deliveryAddress.addressLine.trim();
    const city = deliveryAddress.city.trim();
    const area = deliveryAddress.area.trim();
    const instructions = specialInstructions ? specialInstructions.trim() : "";

    if (addressLine.length < 8 || addressLine.length > 120) {
      return res.status(400).json({
        success: false,
        message: "Address must be between 8 and 120 characters",
      });
    }

    if (city.length < 2 || city.length > 40) {
      return res.status(400).json({
        success: false,
        message: "City must be between 2 and 40 characters",
      });
    }

    if (area.length < 2 || area.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Area must be between 2 and 60 characters",
      });
    }

    if (instructions.length > 180) {
      return res.status(400).json({
        success: false,
        message: "Special instructions cannot be more than 180 characters",
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
      const quantity = Number(item.quantity);

      if (!quantity || quantity < 1 || quantity > 50) {
        return res.status(400).json({
          success: false,
          message: "Item quantity must be between 1 and 50",
        });
      }

      const itemType = item.itemType || "menu";

      if (!["menu", "deal"].includes(itemType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid item type",
        });
      }

      if (itemType === "deal") {
        const deal = await Deal.findById(item.deal);

        if (!deal || !deal.isActive) {
          return res.status(404).json({
            success: false,
            message: "One or more deals are not available",
          });
        }

        subtotal += deal.dealPrice * quantity;

        orderItems.push({
          itemType: "deal",
          menuItem: null,
          deal: deal._id,
          name: deal.title,
          price: deal.dealPrice,
          quantity,
        });
      } else {
        const menuItem = await MenuItem.findById(item.menuItem);

        if (!menuItem || !menuItem.isAvailable) {
          return res.status(404).json({
            success: false,
            message: "One or more menu items are not available",
          });
        }

        const finalPrice =
          menuItem.discountPrice && menuItem.discountPrice > 0
            ? menuItem.discountPrice
            : menuItem.price;

        subtotal += finalPrice * quantity;

        orderItems.push({
          itemType: "menu",
          menuItem: menuItem._id,
          deal: null,
          name: menuItem.name,
          price: finalPrice,
          quantity,
        });
      }
    }

    const deliveryFee = 0;
    const totalAmount = subtotal;

    const order = await Order.create({
      customer: req.user._id,
      customerSnapshot: {
        fullName: req.user.fullName,
        phone: req.user.phone,
        email: req.user.email,
      },
      items: orderItems,
      deliveryAddress: {
        addressLine,
        city,
        area,
      },
      specialInstructions: instructions,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pending",
      orderStatus: "Pending",
      hiddenForCustomer: false,
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
    console.error("CREATE ORDER ERROR:", error);

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
    const orders = await Order.find({
      customer: req.user._id,

      // This also shows old orders where hiddenForCustomer field does not exist
      hiddenForCustomer: { $ne: true },
    })
      .populate("items.menuItem", "name image")
      .populate("items.deal", "title image dealPrice")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Customer: Hide completed order from My Orders
const hideMyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (!["Delivered", "Rejected", "Cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Only completed orders can be removed from your list.",
      });
    }

    order.hiddenForCustomer = true;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order removed from your list.",
    });
  } catch (error) {
    console.error("HIDE MY ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove order.",
      error: error.message,
    });
  }
};

// Customer/Admin/Subadmin: Get single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.menuItem", "name image")
      .populate("items.deal", "title image dealPrice");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isOrderOwner = order.customer.toString() === req.user._id.toString();
    const isAdminOrSubadmin = ["admin", "subadmin"].includes(req.user.role);

    if (!isOrderOwner && !isAdminOrSubadmin) {
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
    console.error("GET ORDER BY ID ERROR:", error);

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
    console.error("CANCEL ORDER ERROR:", error);

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
  hideMyOrder,
};