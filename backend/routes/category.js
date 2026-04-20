const router = require('express').Router();

const {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory
} = require('../controllers/category');

router.post('/add-category', addCategory);
router.get('/get-categories', getCategories);
router.put('/update-category/:id', updateCategory);
router.delete('/delete-category/:id', deleteCategory);

module.exports = router;