const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    gasto_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    usuario_id: {
      type: String,
      required: true,
      trim: true
    },
    categoria_id: {
      type: String,
      required: true,
      trim: true
    },
    monto: {
      type: Number,
      required: true,
      min: 0
    },
    descripcion: {
      type: String,
      required: true,
      trim: true
    },
    fecha: {
      type: Date,
      required: true
    }
  },
  { timestamps: true, collection: 'gastos' }
);

module.exports = mongoose.model('Gasto', ExpenseSchema);