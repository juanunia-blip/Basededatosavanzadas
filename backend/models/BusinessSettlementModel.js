// backend/models/BusinessSettlementModel.js

const mongoose = require("mongoose");

const BusinessSettlementSchema = new mongoose.Schema(
  {
    usuario_id: {
      type: String,
      required: true,
      index: true,
    },

    negocio_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Negocio",
      required: true,
      index: true,
    },

    trabajador_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrabajadorNegocio",
      required: true,
      index: true,
    },

    trabajador_nombre: {
      type: String,
      required: true,
      trim: true,
    },

    fecha_inicio: {
      type: Date,
      required: true,
    },

    fecha_fin: {
      type: Date,
      required: true,
    },

    periodo: {
      type: String,
      enum: ["semana", "quincena", "mes", "personalizado"],
      default: "semana",
    },

    total_kilos: {
      type: Number,
      default: 0,
    },

    precio_kilo_promedio: {
      type: Number,
      default: 0,
    },

    total_pago: {
      type: Number,
      default: 0,
    },

    abonado: {
      type: Number,
      default: 0,
    },

    pendiente: {
      type: Number,
      default: 0,
    },

    estado: {
      type: String,
      enum: ["pendiente", "abonado", "pagado"],
      default: "pendiente",
    },

    producciones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProduccionNegocio",
      },
    ],

    observacion: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "liquidaciones_negocio",
  }
);

BusinessSettlementSchema.pre("save", function (next) {
  this.pendiente = Math.max(
    Number(this.total_pago || 0) - Number(this.abonado || 0),
    0
  );

  if (Number(this.abonado || 0) <= 0) {
    this.estado = "pendiente";
  } else if (Number(this.abonado || 0) < Number(this.total_pago || 0)) {
    this.estado = "abonado";
  } else {
    this.estado = "pagado";
  }

  next();
});

module.exports = mongoose.model(
  "LiquidacionNegocio",
  BusinessSettlementSchema
);