const router = require('express').Router();
const {
  addSaving,
  getSavings,
  updateSaving,
  deleteSaving
} = require('../controllers/saving');

router.post('/add-saving', addSaving);
router.get('/get-savings', getSavings);
router.put('/update-saving/:id', updateSaving);
router.delete('/delete-saving/:id', deleteSaving);

module.exports = router;