const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const {
  getAllOrders,
  getAdminOrderById,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
} = require("../controllers/adminOrderController");

const router = express.Router();

router.get("/dashboard", protect, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Paradise Burger Admin Dashboard",
    data: {
      user: req.user,
    },
  });
});

router.get("/orders", protect, authorizeRoles("admin","subadmin"), getAllOrders);
router.get("/orders/:id", protect, authorizeRoles("admin", "subadmin"), getAdminOrderById);
router.put("/orders/:id/accept", protect, authorizeRoles("admin", "subadmin"), acceptOrder);
router.put("/orders/:id/reject", protect,authorizeRoles("admin", "subadmin"), rejectOrder);
router.put("/orders/:id/status", protect, authorizeRoles("admin", "subadmin"), updateOrderStatus);

module.exports = router;