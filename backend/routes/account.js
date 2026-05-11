const router = require("express").Router();

const {
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
} = require("../controllers/account");

// Obtener cuentas
router.get("/get-accounts", getAccounts);

// Crear cuenta
router.post("/add-account", addAccount);

// Actualizar cuenta
router.put("/update-account/:id", updateAccount);

// Eliminar cuenta
router.delete("/delete-account/:id", deleteAccount);

module.exports = router;