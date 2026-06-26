const Order = require("../models/Order");
const { getOrCreateShopSetting, getBusinessShiftInfo } = require("../utils/shopUtils");

const pad = (value) => String(value).padStart(2, "0");

const escapeCsv = (value) => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value).replace(/"/g, '""');
  return `"${stringValue}"`;
};

const makeCsv = (rows) => {
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
};

const createUtcDateFromLocal = (
  year,
  monthIndex,
  day,
  hours,
  minutes,
  timezoneOffsetMinutes
) => {
  return new Date(
    Date.UTC(year, monthIndex, day, hours, minutes, 0, 0) -
      timezoneOffsetMinutes * 60 * 1000
  );
};

const getMonthlyRange = (monthValue, timezoneOffsetMinutes = 300) => {
  const now = new Date();
  const localNow = new Date(now.getTime() + timezoneOffsetMinutes * 60 * 1000);

  let year = localNow.getUTCFullYear();
  let month = localNow.getUTCMonth() + 1;

  if (monthValue && /^\d{4}-\d{2}$/.test(monthValue)) {
    const [inputYear, inputMonth] = monthValue.split("-").map(Number);
    year = inputYear;
    month = inputMonth;
  }

  const start = createUtcDateFromLocal(
    year,
    month - 1,
    1,
    0,
    0,
    timezoneOffsetMinutes
  );

  const end = createUtcDateFromLocal(
    month === 12 ? year + 1 : year,
    month === 12 ? 0 : month,
    1,
    0,
    0,
    timezoneOffsetMinutes
  );

  return {
    label: `${year}-${pad(month)}`,
    start,
    end,
  };
};

const getLastMonthlyRange = (timezoneOffsetMinutes = 300) => {
  const now = new Date();
  const localNow = new Date(now.getTime() + timezoneOffsetMinutes * 60 * 1000);

  let year = localNow.getUTCFullYear();
  let month = localNow.getUTCMonth();

  if (month === 0) {
    year -= 1;
    month = 12;
  }

  return getMonthlyRange(`${year}-${pad(month)}`, timezoneOffsetMinutes);
};

const buildReportFromOrders = (orders, periodInfo) => {
  const statusCounts = {
    Pending: 0,
    Accepted: 0,
    Preparing: 0,
    Ready: 0,
    Delivered: 0,
    Rejected: 0,
    Cancelled: 0,
  };

  const itemMap = new Map();
  const dealMap = new Map();

  let totalSales = 0;

  orders.forEach((order) => {
    const status = order.orderStatus || "Unknown";
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    if (order.orderStatus === "Delivered") {
      totalSales += Number(order.totalAmount || 0);

      (order.items || []).forEach((item) => {
        const quantity = Number(item.quantity || 0);
        const revenue = Number(item.price || 0) * quantity;
        const name = item.name || "Unknown Item";

        const targetMap = item.itemType === "deal" ? dealMap : itemMap;

        if (!targetMap.has(name)) {
          targetMap.set(name, {
            name,
            itemType: item.itemType || "menu",
            quantity: 0,
            revenue: 0,
          });
        }

        const existing = targetMap.get(name);
        existing.quantity += quantity;
        existing.revenue += revenue;
      });
    }
  });

  const sortByRevenue = (map) =>
    Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);

  const deliveredOrders = statusCounts.Delivered || 0;

  return {
    period: periodInfo,
    summary: {
      totalOrders: orders.length,
      pending: statusCounts.Pending || 0,
      accepted: statusCounts.Accepted || 0,
      preparing: statusCounts.Preparing || 0,
      ready: statusCounts.Ready || 0,
      delivered: deliveredOrders,
      rejected: statusCounts.Rejected || 0,
      cancelled: statusCounts.Cancelled || 0,
      totalSales,
      averageDeliveredOrderValue:
        deliveredOrders > 0 ? Math.round(totalSales / deliveredOrders) : 0,
    },
    topMenuItems: sortByRevenue(itemMap),
    topDeals: sortByRevenue(dealMap),
    orders: orders.map((order) => ({
      id: order._id,
      shortId: order._id.toString().slice(-6).toUpperCase(),
      customer:
        order.customerSnapshot?.fullName ||
        order.customer?.fullName ||
        "Customer",
      phone: order.customerSnapshot?.phone || order.customer?.phone || "N/A",
      status: order.orderStatus,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      businessDate: order.businessDate || "",
      items: order.items || [],
    })),
  };
};

const getTodayReport = async (req, res) => {
  try {
    const setting = await getOrCreateShopSetting();
    const shift = getBusinessShiftInfo(setting);

    const orders = await Order.find({
      createdAt: {
        $gte: shift.businessShiftStart,
        $lt: shift.businessShiftEnd,
      },
    })
      .populate("customer", "fullName phone")
      .sort({ createdAt: -1 });

    const report = buildReportFromOrders(orders, {
      type: "today-business-shift",
      label: `Business Day ${shift.businessDate}`,
      start: shift.businessShiftStart,
      end: shift.businessShiftEnd,
      businessDate: shift.businessDate,
    });

    return res.status(200).json({
      success: true,
      message: "Today business shift report fetched successfully",
      data: report,
    });
  } catch (error) {
    console.error("TODAY REPORT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch today report",
      error: error.message,
    });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const setting = await getOrCreateShopSetting();
    const range = getMonthlyRange(
      req.query.month,
      setting.timezoneOffsetMinutes || 300
    );

    const orders = await Order.find({
      createdAt: {
        $gte: range.start,
        $lt: range.end,
      },
    })
      .populate("customer", "fullName phone")
      .sort({ createdAt: -1 });

    const report = buildReportFromOrders(orders, {
      type: "monthly",
      label: range.label,
      start: range.start,
      end: range.end,
    });

    return res.status(200).json({
      success: true,
      message: "Monthly report fetched successfully",
      data: report,
    });
  } catch (error) {
    console.error("MONTHLY REPORT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch monthly report",
      error: error.message,
    });
  }
};

const getLastMonthReport = async (req, res) => {
  try {
    const setting = await getOrCreateShopSetting();
    const range = getLastMonthlyRange(setting.timezoneOffsetMinutes || 300);

    const orders = await Order.find({
      createdAt: {
        $gte: range.start,
        $lt: range.end,
      },
    })
      .populate("customer", "fullName phone")
      .sort({ createdAt: -1 });

    const report = buildReportFromOrders(orders, {
      type: "last-month",
      label: range.label,
      start: range.start,
      end: range.end,
    });

    return res.status(200).json({
      success: true,
      message: "Last month report fetched successfully",
      data: report,
    });
  } catch (error) {
    console.error("LAST MONTH REPORT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch last month report",
      error: error.message,
    });
  }
};

const sendReportCsv = (res, report, fileName) => {
  const rows = [];

  rows.push(["Paradise Burger Report"]);
  rows.push(["Period", report.period.label]);
  rows.push(["Start", new Date(report.period.start).toLocaleString()]);
  rows.push(["End", new Date(report.period.end).toLocaleString()]);
  rows.push([]);

  rows.push(["Summary"]);
  rows.push(["Total Orders", report.summary.totalOrders]);
  rows.push(["Pending", report.summary.pending]);
  rows.push(["Accepted", report.summary.accepted]);
  rows.push(["Preparing", report.summary.preparing]);
  rows.push(["Ready", report.summary.ready]);
  rows.push(["Delivered", report.summary.delivered]);
  rows.push(["Rejected", report.summary.rejected]);
  rows.push(["Cancelled", report.summary.cancelled]);
  rows.push(["Total Sales", report.summary.totalSales]);
  rows.push(["Average Delivered Order Value", report.summary.averageDeliveredOrderValue]);
  rows.push([]);

  rows.push(["Top Menu Items"]);
  rows.push(["Item Name", "Quantity Sold", "Revenue"]);
  report.topMenuItems.forEach((item) => {
    rows.push([item.name, item.quantity, item.revenue]);
  });
  rows.push([]);

  rows.push(["Top Deals"]);
  rows.push(["Deal Name", "Quantity Sold", "Revenue"]);
  report.topDeals.forEach((deal) => {
    rows.push([deal.name, deal.quantity, deal.revenue]);
  });
  rows.push([]);

  rows.push(["Orders"]);
  rows.push([
    "Order ID",
    "Customer",
    "Phone",
    "Status",
    "Total Amount",
    "Created At",
    "Business Date",
  ]);

  report.orders.forEach((order) => {
    rows.push([
      `#${order.shortId}`,
      order.customer,
      order.phone,
      order.status,
      order.totalAmount,
      new Date(order.createdAt).toLocaleString(),
      order.businessDate,
    ]);
  });

  const csv = makeCsv(rows);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${fileName}"`
  );

  return res.status(200).send(csv);
};

const exportTodayCsv = async (req, res) => {
  try {
    const setting = await getOrCreateShopSetting();
    const shift = getBusinessShiftInfo(setting);

    const orders = await Order.find({
      createdAt: {
        $gte: shift.businessShiftStart,
        $lt: shift.businessShiftEnd,
      },
    })
      .populate("customer", "fullName phone")
      .sort({ createdAt: -1 });

    const report = buildReportFromOrders(orders, {
      type: "today-business-shift",
      label: `Business Day ${shift.businessDate}`,
      start: shift.businessShiftStart,
      end: shift.businessShiftEnd,
      businessDate: shift.businessDate,
    });

    return sendReportCsv(
      res,
      report,
      `paradise-burger-today-report-${shift.businessDate}.csv`
    );
  } catch (error) {
    console.error("EXPORT TODAY CSV ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to export today CSV",
      error: error.message,
    });
  }
};

const exportMonthlyCsv = async (req, res) => {
  try {
    const setting = await getOrCreateShopSetting();
    const range = getMonthlyRange(
      req.query.month,
      setting.timezoneOffsetMinutes || 300
    );

    const orders = await Order.find({
      createdAt: {
        $gte: range.start,
        $lt: range.end,
      },
    })
      .populate("customer", "fullName phone")
      .sort({ createdAt: -1 });

    const report = buildReportFromOrders(orders, {
      type: "monthly",
      label: range.label,
      start: range.start,
      end: range.end,
    });

    return sendReportCsv(
      res,
      report,
      `paradise-burger-monthly-report-${range.label}.csv`
    );
  } catch (error) {
    console.error("EXPORT MONTHLY CSV ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to export monthly CSV",
      error: error.message,
    });
  }
};

module.exports = {
  getTodayReport,
  getMonthlyReport,
  getLastMonthReport,
  exportTodayCsv,
  exportMonthlyCsv,
};