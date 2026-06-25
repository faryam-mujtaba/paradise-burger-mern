const Deal = require("../models/Deal");

// Public/Admin: Get all active deals
const getActiveDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ isActive: true }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Active deals fetched successfully",
      data: deals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active deals",
      error: error.message,
    });
  }
};

// Admin: Get all deals
const getAllDeals = async (req, res) => {
  try {
    const deals = await Deal.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Deals fetched successfully",
      data: deals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch deals",
      error: error.message,
    });
  }
};

// Admin: Create deal
const createDeal = async (req, res) => {
  try {
    const {
      title,
      description,
      itemsIncluded,
      originalPrice,
      dealPrice,
      image,
      isActive,
    } = req.body;

    if (
      !title ||
      !description ||
      !itemsIncluded ||
      originalPrice === undefined ||
      dealPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, items included, original price, and deal price are required",
      });
    }

    const original = Number(originalPrice);
    const deal = Number(dealPrice);

    if (original <= 0 || deal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Prices must be greater than 0",
      });
    }

    if (deal >= original) {
      return res.status(400).json({
        success: false,
        message: "Deal price must be less than original price",
      });
    }

    const newDeal = await Deal.create({
      title: title.trim(),
      description: description.trim(),
      itemsIncluded: itemsIncluded.trim(),
      originalPrice: original,
      dealPrice: deal,
      image: req.file ? `/uploads/deals/${req.file.filename}` : "",
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: "Deal created successfully",
      data: newDeal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create deal",
      error: error.message,
    });
  }
};

// Admin: Update deal
const updateDeal = async (req, res) => {
  try {
    const {
      title,
      description,
      itemsIncluded,
      originalPrice,
      dealPrice,
      image,
      isActive,
    } = req.body;

    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    if (title !== undefined) deal.title = title.trim();
    if (description !== undefined) deal.description = description.trim();
    if (itemsIncluded !== undefined) deal.itemsIncluded = itemsIncluded.trim();
    if (req.file) {
  deal.image = `/uploads/deals/${req.file.filename}`;
}

    if (originalPrice !== undefined) {
      deal.originalPrice = Number(originalPrice);
    }

    if (dealPrice !== undefined) {
      deal.dealPrice = Number(dealPrice);
    }

    if (isActive !== undefined) {
      deal.isActive = isActive;
    }

    if (deal.originalPrice <= 0 || deal.dealPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Prices must be greater than 0",
      });
    }

    if (deal.dealPrice >= deal.originalPrice) {
      return res.status(400).json({
        success: false,
        message: "Deal price must be less than original price",
      });
    }

    await deal.save();

    return res.status(200).json({
      success: true,
      message: "Deal updated successfully",
      data: deal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update deal",
      error: error.message,
    });
  }
};

// Admin: Delete deal
const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    await deal.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Deal deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete deal",
      error: error.message,
    });
  }
};

module.exports = {
  getActiveDeals,
  getAllDeals,
  createDeal,
  updateDeal,
  deleteDeal,
};