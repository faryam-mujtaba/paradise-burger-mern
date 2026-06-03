const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");

const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("customer"), createOrder);
router.get("/my-orders", protect, authorizeRoles("customer"), getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, authorizeRoles("customer"), cancelOrder);

module.exports = router;