const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  hideMyOrder,
} = require("../controllers/orderController");

const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Customer routes
router.post("/", protect, authorizeRoles("customer"), createOrder);

router.get(
  "/my-orders",
  protect,
  authorizeRoles("customer"),
  getMyOrders
);

router.put(
  "/:id/cancel",
  protect,
  authorizeRoles("customer"),
  cancelOrder
);

router.put(
  "/:id/hide",
  protect,
  authorizeRoles("customer"),
  hideMyOrder
);

// Single order route
router.get("/:id", protect, getOrderById);

module.exports = router;