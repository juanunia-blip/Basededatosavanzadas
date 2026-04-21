const router = require('express').Router();
const { balanceAlert, financialStatus } = require('../controllers/report');

router.get('/balance-alert', balanceAlert);
router.get('/financial-status', financialStatus);

module.exports = router;