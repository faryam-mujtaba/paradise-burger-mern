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
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  upload.single("image"),
  createMenuItem
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  upload.single("image"),
  updateMenuItem
);

router.delete("/:id", protect, authorizeRoles("admin"), deleteMenuItem);

module.exports = router;