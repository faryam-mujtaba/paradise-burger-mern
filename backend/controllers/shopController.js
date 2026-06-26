const {
  getOrCreateShopSetting,
  getShopRuntimeStatus,
} = require("../utils/shopUtils");

const isValidTime = (time) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};

// Public: customer/admin can check shop status
const getShopStatus = async (req, res) => {
  try {
    const status = await getShopRuntimeStatus();

    return res.status(200).json({
      success: true,
      message: "Shop status fetched successfully",
      data: {
        isOpen: status.isOpen,
        message: status.message,
        mode: status.setting.mode,
        openingTime: status.setting.openingTime,
        closingTime: status.setting.closingTime,
        businessDayStartTime: status.setting.businessDayStartTime,
        allowOrders: status.setting.allowOrders,
        closedUntil: status.setting.closedUntil,
        closedReason: status.setting.closedReason,
        customerMessage: status.setting.customerMessage,
        timezoneOffsetMinutes: status.setting.timezoneOffsetMinutes,
        nextOpeningAt: status.nextOpeningAt || null,
      },
    });
  } catch (error) {
    console.error("GET SHOP STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop status",
      error: error.message,
    });
  }
};

// Admin: get full shop settings
const getShopSettings = async (req, res) => {
  try {
    const setting = await getOrCreateShopSetting();
    const status = await getShopRuntimeStatus();

    return res.status(200).json({
      success: true,
      message: "Shop settings fetched successfully",
      data: {
        ...setting.toObject(),
        isOpenNow: status.isOpen,
        runtimeMessage: status.message,
        nextOpeningAt: status.nextOpeningAt || null,
      },
    });
  } catch (error) {
    console.error("GET SHOP SETTINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop settings",
      error: error.message,
    });
  }
};

// Admin: update all timing/settings
const updateShopSettings = async (req, res) => {
  try {
    const {
      openingTime,
      closingTime,
      businessDayStartTime,
      mode,
      allowOrders,
      closedUntil,
      closedReason,
      customerMessage,
      timezoneOffsetMinutes,
    } = req.body;

    const setting = await getOrCreateShopSetting();

    if (openingTime !== undefined) {
      if (!isValidTime(openingTime)) {
        return res.status(400).json({
          success: false,
          message: "Opening time must be in HH:mm format",
        });
      }

      setting.openingTime = openingTime;
    }

    if (closingTime !== undefined) {
      if (!isValidTime(closingTime)) {
        return res.status(400).json({
          success: false,
          message: "Closing time must be in HH:mm format",
        });
      }

      setting.closingTime = closingTime;
    }

    if (businessDayStartTime !== undefined) {
      if (!isValidTime(businessDayStartTime)) {
        return res.status(400).json({
          success: false,
          message: "Business day start time must be in HH:mm format",
        });
      }

      setting.businessDayStartTime = businessDayStartTime;
    }

    if (mode !== undefined) {
      if (!["auto", "forceOpen", "forceClosed"].includes(mode)) {
        return res.status(400).json({
          success: false,
          message: "Invalid shop mode",
        });
      }

      setting.mode = mode;
    }

    if (allowOrders !== undefined) {
      setting.allowOrders = Boolean(allowOrders);
    }

    if (closedUntil !== undefined) {
      setting.closedUntil = closedUntil ? new Date(closedUntil) : null;
    }

    if (closedReason !== undefined) {
      setting.closedReason = String(closedReason || "").trim();
    }

    if (customerMessage !== undefined) {
      setting.customerMessage = String(customerMessage || "").trim();
    }

    if (timezoneOffsetMinutes !== undefined) {
      const offset = Number(timezoneOffsetMinutes);

      if (Number.isNaN(offset)) {
        return res.status(400).json({
          success: false,
          message: "Invalid timezone offset",
        });
      }

      setting.timezoneOffsetMinutes = offset;
    }

    await setting.save();

    const status = await getShopRuntimeStatus();

    return res.status(200).json({
      success: true,
      message: "Shop settings updated successfully",
      data: {
        ...setting.toObject(),
        isOpenNow: status.isOpen,
        runtimeMessage: status.message,
        nextOpeningAt: status.nextOpeningAt || null,
      },
    });
  } catch (error) {
    console.error("UPDATE SHOP SETTINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update shop settings",
      error: error.message,
    });
  }
};

// Admin shortcut: force close shop
const closeShop = async (req, res) => {
  try {
    const { closedUntil, closedReason, customerMessage } = req.body;

    const setting = await getOrCreateShopSetting();

    setting.mode = "forceClosed";
    setting.allowOrders = true;
    setting.closedUntil = closedUntil ? new Date(closedUntil) : null;
    setting.closedReason = String(closedReason || "").trim();
    setting.customerMessage = String(customerMessage || "").trim();

    await setting.save();

    const status = await getShopRuntimeStatus();

    return res.status(200).json({
      success: true,
      message: "Shop closed successfully",
      data: {
        ...setting.toObject(),
        isOpenNow: status.isOpen,
        runtimeMessage: status.message,
      },
    });
  } catch (error) {
    console.error("CLOSE SHOP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to close shop",
      error: error.message,
    });
  }
};

// Admin shortcut: force open shop
const openShop = async (req, res) => {
  try {
    const setting = await getOrCreateShopSetting();

    setting.mode = "forceOpen";
    setting.allowOrders = true;
    setting.closedUntil = null;
    setting.closedReason = "";
    setting.customerMessage = "Shop is open now. You can place your order.";

    await setting.save();

    const status = await getShopRuntimeStatus();

    return res.status(200).json({
      success: true,
      message: "Shop opened successfully",
      data: {
        ...setting.toObject(),
        isOpenNow: status.isOpen,
        runtimeMessage: status.message,
      },
    });
  } catch (error) {
    console.error("OPEN SHOP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to open shop",
      error: error.message,
    });
  }
};

// Admin shortcut: return to auto timing
const setAutoMode = async (req, res) => {
  try {
    const setting = await getOrCreateShopSetting();

    setting.mode = "auto";
    setting.allowOrders = true;
    setting.closedUntil = null;
    setting.closedReason = "";
    setting.customerMessage = "";

    await setting.save();

    const status = await getShopRuntimeStatus();

    return res.status(200).json({
      success: true,
      message: "Shop set to auto timing successfully",
      data: {
        ...setting.toObject(),
        isOpenNow: status.isOpen,
        runtimeMessage: status.message,
        nextOpeningAt: status.nextOpeningAt || null,
      },
    });
  } catch (error) {
    console.error("AUTO SHOP MODE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to set auto timing",
      error: error.message,
    });
  }
};

module.exports = {
  getShopStatus,
  getShopSettings,
  updateShopSettings,
  closeShop,
  openShop,
  setAutoMode,
};