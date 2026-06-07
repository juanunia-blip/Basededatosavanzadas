const router = require("express").Router();

const { protect } = require("../middleware/auth");

const {
  createBusiness,
  getBusinesses,
  getBusinessById,
  getBusinessReports,
  updateBusiness,
  deleteBusiness,

  addWorker,
  getWorkers,
  updateWorker,
  deleteWorker,

  addProduction,
  getProductions,
  updateProduction,
  deleteProduction,
  addProductionPayment,

  createSettlement,
  getSettlements,
  getSettlementById,
  addSettlementPayment,
  markSettlementAsPaid,
  cancelSettlement,
  deleteSettlement,
  getUnsettledProductions,

  addBusinessExpense,
  getBusinessExpenses,
  updateBusinessExpense,
  deleteBusinessExpense,

  

  addBusinessSale,
  getBusinessSales,
  updateBusinessSale,
  deleteBusinessSale,

  getBusinessSummary,
} = require("../controllers/business");

/* =========================
   BUSINESS
========================= */

router.post("/businesses", protect, createBusiness);

router.get("/businesses", protect, getBusinesses);

router.get("/businesses/:id", protect, getBusinessById);

router.put("/businesses/:id", protect, updateBusiness);

router.delete("/businesses/:id", protect, deleteBusiness);

/* =========================
   SUMMARY
========================= */

router.get(
  "/businesses/:businessId/summary",
  protect,
  getBusinessSummary
);

/* =========================
   WORKERS
========================= */

router.post(
  "/businesses/:businessId/workers",
  protect,
  addWorker
);

router.get(
  "/businesses/:businessId/workers",
  protect,
  getWorkers
);

router.put(
  "/businesses/:businessId/workers/:workerId",
  protect,
  updateWorker
);

router.delete(
  "/businesses/:businessId/workers/:workerId",
  protect,
  deleteWorker
);

/* =========================
   PRODUCTIONS
========================= */

router.post(
  "/businesses/:businessId/productions",
  protect,
  addProduction
);

router.get(
  "/businesses/:businessId/productions",
  protect,
  getProductions
);

router.get(
  "/businesses/:businessId/productions-unsettled",
  protect,
  getUnsettledProductions
);

router.put(
  "/businesses/:businessId/productions/:productionId",
  protect,
  updateProduction
);

router.delete(
  "/businesses/:businessId/productions/:productionId",
  protect,
  deleteProduction
);

router.patch(
  "/businesses/:businessId/productions/:productionId/payment",
  protect,
  addProductionPayment
);

/* =========================
   SETTLEMENTS / LIQUIDACIONES
========================= */

router.post(
  "/businesses/:businessId/settlements",
  protect,
  createSettlement
);

router.get(
  "/businesses/:businessId/settlements",
  protect,
  getSettlements
);

router.get(
  "/businesses/:businessId/settlements/:settlementId",
  protect,
  getSettlementById
);

router.patch(
  "/businesses/:businessId/settlements/:settlementId/payment",
  protect,
  addSettlementPayment
);

router.patch(
  "/businesses/:businessId/settlements/:settlementId/mark-paid",
  protect,
  markSettlementAsPaid
);

router.delete(
  "/businesses/:businessId/settlements/:settlementId",
  protect,
  deleteSettlement
);

/* =========================
   EXPENSES
========================= */

router.post(
  "/businesses/:businessId/expenses",
  protect,
  addBusinessExpense
);

router.get(
  "/businesses/:businessId/expenses",
  protect,
  getBusinessExpenses
);

router.put(
  "/businesses/:businessId/expenses/:expenseId",
  protect,
  updateBusinessExpense
);

router.delete(
  "/businesses/:businessId/expenses/:expenseId",
  protect,
  deleteBusinessExpense
);

/* =========================
   SALES
========================= */

router.post(
  "/businesses/:businessId/sales",
  protect,
  addBusinessSale
);

router.get(
  "/businesses/:businessId/sales",
  protect,
  getBusinessSales
);

router.put(
  "/businesses/:businessId/sales/:saleId",
  protect,
  updateBusinessSale
);

router.delete(
  "/businesses/:businessId/sales/:saleId",
  protect,
  deleteBusinessSale
);
router.get(
  "/businesses/:businessId/reports",
  protect,
  getBusinessReports
);

router.patch(
  "/businesses/:businessId/settlements/:settlementId/cancel",
  protect,
  cancelSettlement
);

module.exports = router;