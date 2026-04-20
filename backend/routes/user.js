const router = require('express').Router();

const {
  addUser,
  getUsers,
  getUserByUsuarioId,
  updateUser,
  deleteUser
} = require('../controllers/user');

router.post('/add-user', addUser);
router.get('/get-users', getUsers);
router.get('/get-user/:usuario_id', getUserByUsuarioId);
router.put('/update-user/:id', updateUser);
router.delete('/delete-user/:id', deleteUser);

module.exports = router;