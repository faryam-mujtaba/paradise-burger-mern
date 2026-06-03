const express = require("express");

const {
  updateRiderAvailability,
  getMyRiderProfile,
  getAssignedOrders,
  markOrderPickedUp,
  markOrderOutForDelivery,
  markOrderDelivered,
  markOrderFailed,
} = require("../controllers/riderController");

const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/profile", protect, authorizeRoles("rider"), getMyRiderProfile);
router.put("/availability", protect, authorizeRoles("rider"), updateRiderAvailability);

router.get("/orders", protect, authorizeRoles("rider"), getAssignedOrders);
router.put("/orders/:id/pickup", protect, authorizeRoles("rider"), markOrderPickedUp);
router.put("/orders/:id/out-for-delivery", protect, authorizeRoles("rider"), markOrderOutForDelivery);
router.put("/orders/:id/delivered", protect, authorizeRoles("rider"), markOrderDelivered);
router.put("/orders/:id/failed", protect, authorizeRoles("rider"), markOrderFailed);

module.exports = router;