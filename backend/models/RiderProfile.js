const mongoose = require("mongoose");

const riderProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    bikeType: {
      type: String,
      required: true,
      trim: true,
    },
    bikeNumberPlate: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    availabilityCount: {
      type: Number,
      default: 0,
    },
    totalAssignedOrders: {
      type: Number,
      default: 0,
    },
    totalCompletedDeliveries: {
      type: Number,
      default: 0,
    },
    totalFailedDeliveries: {
      type: Number,
      default: 0,
    },
    behaviorNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RiderProfile", riderProfileSchema);