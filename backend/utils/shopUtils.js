const ShopSetting = require("../models/ShopSetting");

const pad = (value) => String(value).padStart(2, "0");

const parseTimeToMinutes = (timeString, fallback = "17:00") => {
  const value = timeString || fallback;
  const [hours, minutes] = value.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    const [fallbackHours, fallbackMinutes] = fallback.split(":").map(Number);
    return fallbackHours * 60 + fallbackMinutes;
  }

  return hours * 60 + minutes;
};

const minutesToTimeParts = (minutesValue) => {
  const hours = Math.floor(minutesValue / 60);
  const minutes = minutesValue % 60;

  return {
    hours,
    minutes,
  };
};

const getLocalParts = (date, timezoneOffsetMinutes = 300) => {
  const localDate = new Date(date.getTime() + timezoneOffsetMinutes * 60 * 1000);

  return {
    year: localDate.getUTCFullYear(),
    month: localDate.getUTCMonth(),
    day: localDate.getUTCDate(),
    hours: localDate.getUTCHours(),
    minutes: localDate.getUTCMinutes(),
  };
};

const createUtcDateFromLocalParts = (
  localParts,
  hours,
  minutes,
  timezoneOffsetMinutes = 300
) => {
  return new Date(
    Date.UTC(
      localParts.year,
      localParts.month,
      localParts.day,
      hours,
      minutes,
      0,
      0
    ) -
      timezoneOffsetMinutes * 60 * 1000
  );
};

const addDaysToLocalParts = (localParts, days) => {
  const date = new Date(
    Date.UTC(localParts.year, localParts.month, localParts.day + days)
  );

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
    hours: localParts.hours,
    minutes: localParts.minutes,
  };
};

const getLocalDateKey = (localParts) => {
  return `${localParts.year}-${pad(localParts.month + 1)}-${pad(
    localParts.day
  )}`;
};

const getOrCreateShopSetting = async () => {
  let setting = await ShopSetting.findOne().sort({ createdAt: 1 });

  if (!setting) {
    setting = await ShopSetting.create({
      openingTime: "17:00",
      closingTime: "05:00",
      businessDayStartTime: "17:00",
      mode: "auto",
      allowOrders: true,
      timezoneOffsetMinutes: 300,
    });
  }

  return setting;
};

const getAutoShopStatus = (setting, now = new Date()) => {
  const timezoneOffsetMinutes = Number(setting.timezoneOffsetMinutes || 300);

  const openingMinutes = parseTimeToMinutes(setting.openingTime, "17:00");
  const closingMinutes = parseTimeToMinutes(setting.closingTime, "05:00");

  const localParts = getLocalParts(now, timezoneOffsetMinutes);
  const currentMinutes = localParts.hours * 60 + localParts.minutes;

  let isOpen = false;

  if (openingMinutes === closingMinutes) {
    isOpen = true;
  } else if (openingMinutes < closingMinutes) {
    isOpen =
      currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
  } else {
    isOpen =
      currentMinutes >= openingMinutes || currentMinutes < closingMinutes;
  }

  let nextOpeningAt = null;

  if (!isOpen) {
    const openingParts = minutesToTimeParts(openingMinutes);
    let openingDateParts = localParts;

    if (openingMinutes < closingMinutes && currentMinutes >= closingMinutes) {
      openingDateParts = addDaysToLocalParts(localParts, 1);
    }

    nextOpeningAt = createUtcDateFromLocalParts(
      openingDateParts,
      openingParts.hours,
      openingParts.minutes,
      timezoneOffsetMinutes
    );
  }

  return {
    isOpen,
    nextOpeningAt,
  };
};

const getShopRuntimeStatus = async (now = new Date()) => {
  const setting = await getOrCreateShopSetting();

  if (
    setting.mode === "forceClosed" &&
    setting.closedUntil &&
    now >= new Date(setting.closedUntil)
  ) {
    setting.mode = "auto";
    setting.closedUntil = null;
    setting.closedReason = "";
    await setting.save();
  }

  if (!setting.allowOrders) {
    return {
      isOpen: false,
      setting,
      message:
        setting.customerMessage ||
        "Shop is currently not accepting orders.",
    };
  }

  if (setting.mode === "forceOpen") {
    return {
      isOpen: true,
      setting,
      message: setting.customerMessage || "Shop is open now.",
    };
  }

  if (setting.mode === "forceClosed") {
    const closedUntilText = setting.closedUntil
      ? ` until ${new Date(setting.closedUntil).toLocaleString()}`
      : "";

    return {
      isOpen: false,
      setting,
      message:
        setting.customerMessage ||
        `Shop is currently closed${closedUntilText}. ${
          setting.closedReason ? `Reason: ${setting.closedReason}` : ""
        }`.trim(),
    };
  }

  const autoStatus = getAutoShopStatus(setting, now);

  if (autoStatus.isOpen) {
    return {
      isOpen: true,
      setting,
      message: "Shop is open now.",
    };
  }

  return {
    isOpen: false,
    setting,
    nextOpeningAt: autoStatus.nextOpeningAt,
    message: autoStatus.nextOpeningAt
      ? `Shop is closed now. We will open at ${autoStatus.nextOpeningAt.toLocaleString()}.`
      : "Shop is closed now.",
  };
};

const getBusinessShiftInfo = (setting, now = new Date()) => {
  const timezoneOffsetMinutes = Number(setting.timezoneOffsetMinutes || 300);

  const businessStartMinutes = parseTimeToMinutes(
    setting.businessDayStartTime,
    "17:00"
  );

  const closingMinutes = parseTimeToMinutes(setting.closingTime, "05:00");

  const localParts = getLocalParts(now, timezoneOffsetMinutes);
  const currentMinutes = localParts.hours * 60 + localParts.minutes;

  const businessDateParts =
    currentMinutes >= businessStartMinutes
      ? localParts
      : addDaysToLocalParts(localParts, -1);

  const businessStartParts = minutesToTimeParts(businessStartMinutes);
  const closingParts = minutesToTimeParts(closingMinutes);

  const shiftEndDateParts =
    closingMinutes <= businessStartMinutes
      ? addDaysToLocalParts(businessDateParts, 1)
      : businessDateParts;

  const businessShiftStart = createUtcDateFromLocalParts(
    businessDateParts,
    businessStartParts.hours,
    businessStartParts.minutes,
    timezoneOffsetMinutes
  );

  const businessShiftEnd = createUtcDateFromLocalParts(
    shiftEndDateParts,
    closingParts.hours,
    closingParts.minutes,
    timezoneOffsetMinutes
  );

  return {
    businessDate: getLocalDateKey(businessDateParts),
    businessShiftStart,
    businessShiftEnd,
  };
};

module.exports = {
  getOrCreateShopSetting,
  getShopRuntimeStatus,
  getBusinessShiftInfo,
};