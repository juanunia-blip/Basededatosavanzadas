const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema(
  {
    ingreso_id: {
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
    fuente: {
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
  { timestamps: true, collection: 'ingresos' }
);

module.exports = mongoose.model('Ingreso', IncomeSchema);