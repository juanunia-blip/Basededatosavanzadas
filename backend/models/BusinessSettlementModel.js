// backend/models/BusinessSettlementModel.js

const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    monto: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    fecha: {
      type: Date,
      default: Date.now,
    },

    observacion: {
      type: String,
      default: "",
      trim: true,
    },

    medio_pago: {
      type: String,
      default: "",
      trim: true,
    },

    registrado_por: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

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
      min: 0,
    },

    precio_kilo_promedio: {
      type: Number,
      default: 0,
      min: 0,
    },

    total_pago: {
      type: Number,
      default: 0,
      min: 0,
    },

    abonado: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendiente: {
      type: Number,
      default: 0,
      min: 0,
    },

    estado: {
      type: String,
      enum: ["pendiente", "abonado", "pagado"],
      default: "pendiente",
    },

    /*
    ==========================================
    HISTORIAL DE PAGOS
    ==========================================
    */
    pagos: [PaymentSchema],

    /*
    ==========================================
    ANULACIÓN CONTABLE
    ==========================================
    */
    anulada: {
      type: Boolean,
      default: false,
      index: true,
    },

    fecha_anulacion: {
      type: Date,
      default: null,
    },

    motivo_anulacion: {
      type: String,
      default: "",
      trim: true,
    },

    anulada_por: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    ==========================================
    PRODUCCIONES ASOCIADAS
    ==========================================
    */
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

/*
==========================================
RECALCULAR AUTOMÁTICAMENTE
==========================================
*/

BusinessSettlementSchema.pre("save", function (next) {
  const totalPago = Number(this.total_pago || 0);

  const abonado = Math.min(
    Number(this.abonado || 0),
    totalPago
  );

  this.abonado = abonado;

  this.pendiente = Math.max(
    totalPago - abonado,
    0
  );

  /*
    Si está anulada,
    mantenemos el último estado registrado.
    No alteramos el historial.
  */
  if (this.anulada) {
    return next();
  }

  if (abonado <= 0) {
    this.estado = "pendiente";
  } else if (abonado < totalPago) {
    this.estado = "abonado";
  } else {
    this.estado = "pagado";
  }

  next();
});

/*
==========================================
ÍNDICES
==========================================
*/

BusinessSettlementSchema.index({
  usuario_id: 1,
  negocio_id: 1,
});

BusinessSettlementSchema.index({
  negocio_id: 1,
  trabajador_id: 1,
});

BusinessSettlementSchema.index({
  negocio_id: 1,
  fecha_inicio: -1,
});

module.exports = mongoose.model(
  "LiquidacionNegocio",
  BusinessSettlementSchema
);