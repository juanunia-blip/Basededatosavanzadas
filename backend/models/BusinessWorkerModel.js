const mongoose = require("mongoose");

const BusinessWorkerSchema = new mongoose.Schema(
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

    trabajador_id: {
      type: String,
      required: true,
      trim: true,
    },

    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    telefono: {
      type: String,
      default: "",
      trim: true,
    },

    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "trabajadores_negocio",
  }
);

BusinessWorkerSchema.index(
  {
    usuario_id: 1,
    negocio_id: 1,
    trabajador_id: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "TrabajadorNegocio",
  BusinessWorkerSchema
);