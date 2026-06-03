const express = require("express");

const {
  updateRiderAvailability,
  getMyRiderProfile,
} = require("../controllers/riderController");

const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/profile", protect, authorizeRoles("rider"), getMyRiderProfile);
router.put("/availability", protect, authorizeRoles("rider"), updateRiderAvailability);

module.exports = router;