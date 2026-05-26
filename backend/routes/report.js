const router = require('express').Router();

const { protect } = require('../middleware/auth');

const {
  balanceAlert,
  financialStatus
} = require('../controllers/report');

/* =========================
   REPORTES FINANCIEROS
========================= */

router.get(
  '/balance-alert',
  protect,
  balanceAlert
);

router.get(
  '/financial-status',
  protect,
  financialStatus
);

module.exports = router;