const router = require('express').Router();

const {
  addSaving,
  getSavings,
  updateSaving,
  deleteSaving,
  savingProgress,
  savingAlert
} = require('../controllers/saving');

router.post('/add-saving', addSaving);
router.get('/get-savings', getSavings);
router.put('/update-saving/:id', updateSaving);
router.delete('/delete-saving/:id', deleteSaving);
router.get('/saving-progress', savingProgress);
router.get('/saving-alert', savingAlert);

module.exports = router;