const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    presupuesto_id: {
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
    limite: {
      type: Number,
      required: true,
      min: 0
    },
    mes: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true, collection: 'presupuestos' }
);

module.exports = mongoose.model('Presupuesto', BudgetSchema);