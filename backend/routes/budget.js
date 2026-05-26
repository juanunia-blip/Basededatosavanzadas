const router = require('express').Router();

const { protect } = require('../middleware/auth');

const {
  addBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  checkBudgetStatus,
  getBudgetAlerts
} = require('../controllers/budget');

/* =========================
   CRUD PRESUPUESTOS
========================= */

router.post(
  '/add-budget',
  protect,
  addBudget
);

router.get(
  '/get-budgets',
  protect,
  getBudgets
);

router.put(
  '/update-budget/:id',
  protect,
  updateBudget
);

router.delete(
  '/delete-budget/:id',
  protect,
  deleteBudget
);

/* =========================
   REPORTES PRESUPUESTO
========================= */

router.get(
  '/check-budget',
  protect,
  checkBudgetStatus
);

router.get(
  '/budget-alerts',
  protect,
  getBudgetAlerts
);

module.exports = router;