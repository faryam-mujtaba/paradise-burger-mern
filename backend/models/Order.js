const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerSnapshot: {
      fullName: String,
      phone: String,
      email: String,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    deliveryAddress: {
      addressLine: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      area: {
        type: String,
        required: true,
      },
    },
    specialInstructions: {
      type: String,
      trim: true,
      default: "",
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash on Delivery", "Online Payment"],
      default: "Cash on Delivery",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    transactionId: {
      type: String,
      default: "",
    },
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Preparing",
        "Ready",
        "Assigned to Rider",
        "Picked Up",
        "Out for Delivery",
        "Delivered",
        "Rejected",
        "Cancelled",
        "Failed Delivery",
      ],
      default: "Pending",
    },
    assignedRider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    statusHistory: [statusHistorySchema],
    acceptedAt: Date,
    preparedAt: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);