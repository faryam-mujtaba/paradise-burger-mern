const mongoose = require("mongoose");

const shopSettingSchema = new mongoose.Schema(
  {
    openingTime: {
      type: String,
      default: "17:00",
    },

    closingTime: {
      type: String,
      default: "05:00",
    },

    businessDayStartTime: {
      type: String,
      default: "17:00",
    },

    mode: {
      type: String,
      enum: ["auto", "forceOpen", "forceClosed"],
      default: "auto",
    },

    allowOrders: {
      type: Boolean,
      default: true,
    },

    closedUntil: {
      type: Date,
      default: null,
    },

    closedReason: {
      type: String,
      trim: true,
      default: "",
    },

    customerMessage: {
      type: String,
      trim: true,
      default: "",
    },

    timezoneOffsetMinutes: {
      type: Number,
      default: 300,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ShopSetting", shopSettingSchema);