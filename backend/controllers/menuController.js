const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");

// Public: Get all available menu items
const getMenuItems = async (req, res) => {
  try {
    const { category, search } = req.query;

    const filter = { isAvailable: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const menuItems = await MenuItem.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Menu items fetched successfully",
      data: menuItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
      error: error.message,
    });
  }
};

// Public: Get single menu item
const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate(
      "category",
      "name slug"
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu item fetched successfully",
      data: menuItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch menu item",
      error: error.message,
    });
  }
};

// Admin: Create menu item
const createMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      image,
      isAvailable,
      preparationTime,
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required",
      });
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      discountPrice,
      category,
      image,
      isAvailable,
      preparationTime,
    });

    return res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: menuItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create menu item",
      error: error.message,
    });
  }
};

// Admin: Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    const {
      name,
      description,
      price,
      discountPrice,
      category,
      image,
      isAvailable,
      preparationTime,
    } = req.body;

    if (category) {
      const categoryExists = await Category.findById(category);

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      menuItem.category = category;
    }

    if (name !== undefined) menuItem.name = name;
    if (description !== undefined) menuItem.description = description;
    if (price !== undefined) menuItem.price = price;
    if (discountPrice !== undefined) menuItem.discountPrice = discountPrice;
    if (image !== undefined) menuItem.image = image;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;
    if (preparationTime !== undefined) menuItem.preparationTime = preparationTime;

    await menuItem.save();

    return res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: menuItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update menu item",
      error: error.message,
    });
  }
};

// Admin: Soft delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    menuItem.isAvailable = false;
    await menuItem.save();

    return res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
      data: menuItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete menu item",
      error: error.message,
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};