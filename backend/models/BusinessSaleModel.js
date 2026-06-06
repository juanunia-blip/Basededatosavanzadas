const mongoose = require("mongoose");

const BusinessSaleSchema = new mongoose.Schema(
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

    producto: {
      type: String,
      required: true,
      trim: true,
    },

    kilos: {
      type: Number,
      default: 0,
      min: 0,
    },

    cantidad: {
      type: Number,
      default: 0,
      min: 0,
    },

    precio_kilo: {
      type: Number,
      default: 0,
      min: 0,
    },

    precio_unitario: {
      type: Number,
      default: 0,
      min: 0,
    },

    total_venta: {
      type: Number,
      required: true,
      min: 0,
    },

    fecha: {
      type: Date,
      required: true,
    },

    comprador: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "ventas_negocio",
  }
);

BusinessSaleSchema.pre("validate", function (next) {
  if (!this.total_venta || this.total_venta <= 0) {
    const totalPorKilo =
      Number(this.kilos || 0) * Number(this.precio_kilo || 0);

    const totalPorUnidad =
      Number(this.cantidad || 0) * Number(this.precio_unitario || 0);

    this.total_venta = totalPorKilo || totalPorUnidad || 0;
  }

  next();
});

module.exports = mongoose.model(
  "VentaNegocio",
  BusinessSaleSchema
);