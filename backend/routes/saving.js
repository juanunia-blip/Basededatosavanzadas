const router = require('express').Router();

const { protect } = require('../middleware/auth');

const {
  addSaving,
  getSavings,
  updateSaving,
  deleteSaving,
  savingProgress,
  savingAlert
} = require('../controllers/saving');

/* =========================
   CRUD AHORROS
========================= */

router.post(
  '/add-saving',
  protect,
  addSaving
);

router.get(
  '/get-savings',
  protect,
  getSavings
);

router.put(
  '/update-saving/:id',
  protect,
  updateSaving
);

router.delete(
  '/delete-saving/:id',
  protect,
  deleteSaving
);

/* =========================
   REPORTES Y MÉTRICAS
========================= */

router.get(
  '/saving-progress',
  protect,
  savingProgress
);

router.get(
  '/saving-alert',
  protect,
  savingAlert
);

module.exports = router;