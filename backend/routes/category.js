const express = require("express");

const router = express.Router();

const {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/category");

const { protect } = require("../middleware/auth");

router.post("/add-category", protect, addCategory);

router.get("/get-categories", protect, getCategories);

router.put("/update-category/:id", protect, updateCategory);

router.delete("/delete-category/:id", protect, deleteCategory);

module.exports = router;