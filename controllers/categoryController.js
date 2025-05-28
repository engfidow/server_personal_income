const db = require("../models/db");

// Create category
exports.createCategory = async (req, res) => {
  const { user_id, name, type } = req.body;
  if (!user_id || !name || !type) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await db.query(
      "INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)",
      [user_id, name, type]
    );
    res.status(201).json({ message: "Category created successfully" });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
};

// Get all categories for a user
exports.getCategories = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM categories WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;

  try {
    await db.query(
      "UPDATE categories SET name = ?, type = ? WHERE id = ?",
      [name, type, id]
    );
    res.json({ message: "Category updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM categories WHERE id = ?", [id]);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
};
