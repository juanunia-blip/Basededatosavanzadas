const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    gasto_id: {
      type: String,
      required: true,
      unique: true,
    },

    usuario_id: {
      type: String,
      required: true,
    },

    categoria_id: {
      type: String,
      required: true,
    },

    cuenta_id: {
      type: String,
      required: false,
      default: null,
    },

    monto: {
      type: Number,
      required: true,
    },

    descripcion: {
      type: String,
      required: true,
      trim: true,
    },

    fecha: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'gastos',
  }
);

module.exports = mongoose.model(
  'Gasto',
  ExpenseSchema
);