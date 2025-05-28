const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.post("/", createCategory); // Add new category
router.get("/:userId", getCategories); // Get categories by user
router.put("/:id", updateCategory); // Update category
router.delete("/:id", deleteCategory); // Delete category

module.exports = router;
