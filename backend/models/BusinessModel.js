const mongoose = require("mongoose");

const BusinessSchema = new mongoose.Schema(
  {
    usuario_id: {
      type: String,
      required: true,
      trim: true,
    },

    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    tipo: {
      type: String,
      required: true,
      enum: ["finca", "barberia", "tienda", "restaurante", "otro"],
      default: "otro",
    },

    ciudad: {
      type: String,
      default: "",
      trim: true,
    },

    descripcion: {
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
    collection: "negocios",
  }
);

BusinessSchema.index(
  {
    usuario_id: 1,
    nombre: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Negocio", BusinessSchema);