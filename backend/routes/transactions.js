const router = require('express').Router();

const {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  totalByUser,
  averageByCategory,
  highExpenses,
  generalReport
} = require('../controllers/expense');

const {
  addIncome,
  getIncomes,
  updateIncome,
  deleteIncome
} = require('../controllers/income');

router.post('/add-income', addIncome);
router.get('/get-incomes', getIncomes);
router.put('/update-income/:id', updateIncome);
router.delete('/delete-income/:id', deleteIncome);

router.post('/add-expense', addExpense);
router.get('/get-expenses', getExpenses);
router.put('/update-expense/:id', updateExpense);
router.delete('/delete-expense/:id', deleteExpense);

router.get('/report/total-by-user', totalByUser);
router.get('/report/average-by-category', averageByCategory);
router.get('/report/high-expenses', highExpenses);
router.get('/report/general-expenses', generalReport);

module.exports = router;