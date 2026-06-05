const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const {
  createRider,
  getAllRiders,
  deactivateRider,
  activateRider,
} = require("../controllers/riderController");
const {
  getAllOrders,
  getAdminOrderById,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  assignOrderToRider,
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

router.get("/orders", protect, authorizeRoles("admin"), getAllOrders);
router.get("/orders/:id", protect, authorizeRoles("admin"), getAdminOrderById);
router.put("/orders/:id/accept", protect, authorizeRoles("admin"), acceptOrder);
router.put("/orders/:id/reject", protect, authorizeRoles("admin"), rejectOrder);
router.put("/orders/:id/status", protect, authorizeRoles("admin"), updateOrderStatus);
router.post("/riders", protect, authorizeRoles("admin"), createRider);
router.get("/riders", protect, authorizeRoles("admin"), getAllRiders);
router.put(
  "/orders/:id/assign-rider",
  protect,
  authorizeRoles("admin"),
  assignOrderToRider
);
router.put("/riders/:id/deactivate", protect, authorizeRoles("admin"), deactivateRider);

router.put("/riders/:id/activate", protect, authorizeRoles("admin"), activateRider);
module.exports = router;