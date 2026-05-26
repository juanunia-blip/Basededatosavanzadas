const router = require("express").Router();

const { protect } = require("../middleware/auth");

/* =========================
   EXPENSES
========================= */

const {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  totalByUser,
  averageByCategory,
  highExpenses,
  generalReport,
  unusualExpenses,
} = require("../controllers/expense");

/* =========================
   INCOMES
========================= */

const {
  addIncome,
  getIncomes,
  updateIncome,
  deleteIncome,
} = require("../controllers/income");

/* =========================
   EXPENSE ROUTES
========================= */

router.post("/add-expense", protect, addExpense);

router.get("/get-expenses", protect, getExpenses);

router.put(
  "/update-expense/:id",
  protect,
  updateExpense
);

router.delete(
  "/delete-expense/:id",
  protect,
  deleteExpense
);

/* =========================
   INCOME ROUTES
========================= */

router.post("/add-income", protect, addIncome);

router.get("/get-incomes", protect, getIncomes);

router.put(
  "/update-income/:id",
  protect,
  updateIncome
);

router.delete(
  "/delete-income/:id",
  protect,
  deleteIncome
);

/* =========================
   REPORTS
========================= */

router.get(
  "/report/total-by-user",
  protect,
  totalByUser
);

router.get(
  "/report/average-by-category",
  protect,
  averageByCategory
);

router.get(
  "/report/high-expenses",
  protect,
  highExpenses
);

router.get(
  "/report/general-expenses",
  protect,
  generalReport
);

router.get(
  "/unusual-expenses",
  protect,
  unusualExpenses
);

module.exports = router;