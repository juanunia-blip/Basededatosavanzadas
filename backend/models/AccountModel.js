const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema(
  {
    cuenta_id: {
      type: String,
      required: true,
      unique: true,
    },
    usuario_id: {
      type: String,
      required: true,
    },
    nombre: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      required: true,
    },
    banco: {
      type: String,
      required: true,
    },
    saldo: {
      type: Number,
      required: true,
      default: 0,
    },
    fecha_corte: {
      type: Number,
      required: true,
    },
    fecha_pago: {
      type: Number,
      required: true,
    },
    activa: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cuenta", AccountSchema, "cuentas");