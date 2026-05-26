const router = require("express").Router();

const { protect } = require("../middleware/auth");

const {
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
} = require("../controllers/account");

/* =========================
   ACCOUNTS
========================= */

// Obtener cuentas
router.get(
  "/get-accounts",
  protect,
  getAccounts
);

// Crear cuenta
router.post(
  "/add-account",
  protect,
  addAccount
);

// Actualizar cuenta
router.put(
  "/update-account/:id",
  protect,
  updateAccount
);

// Eliminar cuenta
router.delete(
  "/delete-account/:id",
  protect,
  deleteAccount
);

module.exports = router;