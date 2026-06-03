const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");

const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ isDeleted: false })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
      error: error.message,
    });
  }
};

const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("category", "name");

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu item",
      error: error.message,
    });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required",
      });
    }

    const categoryExists = await Category.findOne({
      _id: category,
      isDeleted: false,
    });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    let imageUrl = "";

    if (req.file) {
      imageUrl = `/uploads/menu/${req.file.filename}`;
    }

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      imageUrl,
      isAvailable: isAvailable === "false" ? false : true,
    });

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: menuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create menu item",
      error: error.message,
    });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;

    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    if (category) {
      const categoryExists = await Category.findOne({
        _id: category,
        isDeleted: false,
      });

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      menuItem.category = category;
    }

    if (name) menuItem.name = name;
    if (description !== undefined) menuItem.description = description;
    if (price) menuItem.price = price;

    if (isAvailable !== undefined) {
      menuItem.isAvailable = isAvailable === "true" || isAvailable === true;
    }

    if (req.file) {
      menuItem.imageUrl = `/uploads/menu/${req.file.filename}`;
    }

    await menuItem.save();

    const updatedMenuItem = await MenuItem.findById(menuItem._id).populate(
      "category",
      "name"
    );

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: updatedMenuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update menu item",
      error: error.message,
    });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    menuItem.isDeleted = true;
    await menuItem.save();

    res.status(200).json({
      success: true,
      message: "Menu item removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove menu item",
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