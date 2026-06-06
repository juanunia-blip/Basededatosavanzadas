const mongoose = require("mongoose");

const BusinessProductionSchema = new mongoose.Schema(
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrabajadorNegocio",
      required: true,
    },

    trabajador_nombre: {
      type: String,
      required: true,
      trim: true,
    },

    fecha: {
      type: Date,
      required: true,
    },

    kilos: {
      type: Number,
      required: true,
      min: 0,
    },

    precio_kilo: {
      type: Number,
      required: true,
      min: 0,
    },

    total_pago: {
      type: Number,
      required: true,
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

    liquidacion_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiquidacionNegocio",
      default: null,
      index: true,
    },

    observacion: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "producciones_negocio",
  }
);

BusinessProductionSchema.pre("validate", function (next) {
  this.total_pago = Number(this.kilos || 0) * Number(this.precio_kilo || 0);
  this.abonado = Number(this.abonado || 0);

  if (this.abonado > this.total_pago) {
    this.abonado = this.total_pago;
  }

  this.pendiente = this.total_pago - this.abonado;

  if (this.abonado <= 0) {
    this.estado = "pendiente";
  } else if (this.abonado < this.total_pago) {
    this.estado = "abonado";
  } else {
    this.estado = "pagado";
  }

  next();
});


module.exports = mongoose.model(
  "ProduccionNegocio",
  BusinessProductionSchema
);