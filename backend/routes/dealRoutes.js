const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const dealUpload = require("../middlewares/dealUpload");

const {
  getActiveDeals,
  getAllDeals,
  createDeal,
  updateDeal,
  deleteDeal,
} = require("../controllers/dealController");

const router = express.Router();

router.get("/active", getActiveDeals);

router.get("/", protect, authorizeRoles("admin"), getAllDeals);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  dealUpload.single("image"),
  createDeal
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  dealUpload.single("image"),
  updateDeal
);

router.delete("/:id", protect, authorizeRoles("admin"), deleteDeal);

module.exports = router;