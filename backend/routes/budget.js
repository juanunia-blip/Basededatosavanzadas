const router = require('express').Router();

const {
  addBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  checkBudgetStatus
} = require('../controllers/budget');

router.post('/add-budget', addBudget);
router.get('/get-budgets', getBudgets);
router.put('/update-budget/:id', updateBudget);
router.delete('/delete-budget/:id', deleteBudget);
router.get('/check-budget', checkBudgetStatus);

module.exports = router;