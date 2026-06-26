const express = require("express");

const {
  getShopStatus,
  getShopSettings,
  updateShopSettings,
  closeShop,
  openShop,
  setAutoMode,
} = require("../controllers/shopController");

const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Public route for all users
router.get("/status", getShopStatus);

// Admin routes
router.get("/settings", protect, authorizeRoles("admin"), getShopSettings);

router.put("/settings", protect, authorizeRoles("admin"), updateShopSettings);

router.put("/close", protect, authorizeRoles("admin"), closeShop);

router.put("/open", protect, authorizeRoles("admin"), openShop);

router.put("/auto", protect, authorizeRoles("admin"), setAutoMode);

module.exports = router;