const express = require("express");
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");

const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);

router.post("/", protect, authorizeRoles("admin"), createMenuItem);
router.put("/:id", protect, authorizeRoles("admin"), updateMenuItem);
router.delete("/:id", protect, authorizeRoles("admin"), deleteMenuItem);

module.exports = router;