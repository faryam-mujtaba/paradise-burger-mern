const express = require("express");

const {
  getTodayReport,
  getMonthlyReport,
  getLastMonthReport,
  exportTodayCsv,
  exportMonthlyCsv,
} = require("../controllers/adminReportController");

const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/today", protect, authorizeRoles("admin"), getTodayReport);

router.get("/monthly", protect, authorizeRoles("admin"), getMonthlyReport);

router.get("/last-month", protect, authorizeRoles("admin"), getLastMonthReport);

router.get("/export/today", protect, authorizeRoles("admin"), exportTodayCsv);

router.get("/export/monthly", protect, authorizeRoles("admin"), exportMonthlyCsv);

module.exports = router;