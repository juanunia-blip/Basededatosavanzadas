const mongoose = require("mongoose");

const BusinessExpenseSchema = new mongoose.Schema(
  {
    usuario_id: {
      type: String,
      required: true,
      trim: true,
    },

    negocio_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Negocio",
      required: true,
    },

    tipo: {
      type: String,
      required: true,
      enum: [
        "abono",
        "transporte",
        "almuerzo",
        "mantenimiento",
        "herramientas",
        "combustible",
        "servicios",
        "otro",
      ],
    },

    descripcion: {
      type: String,
      required: true,
      trim: true,
    },

    monto: {
      type: Number,
      required: true,
      min: 0,
    },

    fecha: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "gastos_negocio",
  }
);

module.exports = mongoose.model(
  "GastoNegocio",
  BusinessExpenseSchema
);