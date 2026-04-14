const mongoose = require('mongoose');

const SavingSchema = new mongoose.Schema(
  {
    ahorro_id: {
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
    meta: {
      type: String,
      required: true,
      trim: true
    },
    monto_objetivo: {
      type: Number,
      required: true,
      min: 0
    },
    monto_actual: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true, collection: 'ahorros' }
);

module.exports = mongoose.model('Ahorro', SavingSchema);