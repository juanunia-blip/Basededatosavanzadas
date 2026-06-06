const TrabajadorNegocio = require("../../models/BusinessWorkerModel");
const ProduccionNegocio = require("../../models/BusinessProductionModel");
const LiquidacionNegocio = require("../../models/BusinessSettlementModel");

const { getUsuarioId, validarNegocio } = require("./helpers");

const createSettlement = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { businessId } = req.params;

    const {
      trabajador_id,
      fecha_inicio,
      fecha_fin,
      periodo = "semana",
      abonado = 0,
      observacion,
    } = req.body;

    if (!trabajador_id || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        message: "trabajador_id, fecha_inicio y fecha_fin son obligatorios",
      });
    }

    const negocio = await validarNegocio(businessId, usuario_id);

    if (!negocio) {
      return res.status(404).json({
        message: "Negocio no encontrado",
      });
    }

    const trabajador = await TrabajadorNegocio.findOne({
      _id: trabajador_id,
      usuario_id,
      negocio_id: businessId,
    });

    if (!trabajador) {
      return res.status(404).json({
        message: "Trabajador no encontrado",
      });
    }

    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    fin.setHours(23, 59, 59, 999);

    if (inicio > fin) {
      return res.status(400).json({
        message: "La fecha de inicio no puede ser mayor que la fecha fin",
      });
    }

    const producciones = await ProduccionNegocio.find({
      usuario_id,
      negocio_id: businessId,
      trabajador_id,
      liquidacion_id: null,
      fecha: {
        $gte: inicio,
        $lte: fin,
      },
    }).sort({ fecha: 1 });

    if (!producciones.length) {
      return res.status(400).json({
        message:
          "No existen producciones pendientes por liquidar para este trabajador en ese rango de fechas",
      });
    }

    const total_kilos = producciones.reduce(
      (sum, item) => sum + Number(item.kilos || 0),
      0
    );

    const total_pago = producciones.reduce(
      (sum, item) => sum + Number(item.total_pago || 0),
      0
    );

    const precio_kilo_promedio =
      total_kilos > 0 ? Math.round(total_pago / total_kilos) : 0;

    const abonoInicial = Math.min(Number(abonado || 0), total_pago);

    const liquidacion = await LiquidacionNegocio.create({
      usuario_id,
      negocio_id: businessId,
      trabajador_id,
      trabajador_nombre: trabajador.nombre,
      fecha_inicio: inicio,
      fecha_fin: fin,
      periodo,
      total_kilos,
      precio_kilo_promedio,
      total_pago,
      abonado: abonoInicial,
      pendiente: Math.max(total_pago - abonoInicial, 0),
      producciones: producciones.map((item) => item._id),
      observacion: observacion || "",
    });

    await ProduccionNegocio.updateMany(
      {
        _id: {
          $in: producciones.map((item) => item._id),
        },
      },
      {
        $set: {
          liquidacion_id: liquidacion._id,
        },
      }
    );

    res.status(201).json({
      message: "Liquidación creada correctamente",
      data: liquidacion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creando liquidación",
      error: error.message,
    });
  }
};

const getSettlements = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { businessId } = req.params;

    const liquidaciones = await LiquidacionNegocio.find({
      usuario_id,
      negocio_id: businessId,
    }).sort({ fecha_inicio: -1 });

    res.status(200).json(liquidaciones);
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo liquidaciones",
      error: error.message,
    });
  }
};

const getSettlementById = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { businessId, settlementId } = req.params;

    const liquidacion = await LiquidacionNegocio.findOne({
      _id: settlementId,
      usuario_id,
      negocio_id: businessId,
    }).populate("producciones");

    if (!liquidacion) {
      return res.status(404).json({
        message: "Liquidación no encontrada",
      });
    }

    res.status(200).json(liquidacion);
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo liquidación",
      error: error.message,
    });
  }
};

const addSettlementPayment = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { businessId, settlementId } = req.params;
    const monto = Number(req.body.monto);

    if (isNaN(monto) || monto <= 0) {
      return res.status(400).json({
        message: "El abono debe ser mayor que cero",
      });
    }

    const liquidacion = await LiquidacionNegocio.findOne({
      _id: settlementId,
      usuario_id,
      negocio_id: businessId,
    });

    if (!liquidacion) {
      return res.status(404).json({
        message: "Liquidación no encontrada",
      });
    }

    liquidacion.abonado = Number(liquidacion.abonado || 0) + monto;

    if (liquidacion.abonado > liquidacion.total_pago) {
      liquidacion.abonado = liquidacion.total_pago;
    }

    await liquidacion.save();

    res.status(200).json({
      message: "Abono registrado correctamente",
      data: liquidacion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registrando abono",
      error: error.message,
    });
  }
};

const markSettlementAsPaid = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { businessId, settlementId } = req.params;

    const liquidacion = await LiquidacionNegocio.findOne({
      _id: settlementId,
      usuario_id,
      negocio_id: businessId,
    });

    if (!liquidacion) {
      return res.status(404).json({
        message: "Liquidación no encontrada",
      });
    }

    liquidacion.abonado = Number(liquidacion.total_pago || 0);
    await liquidacion.save();

    res.status(200).json({
      message: "Liquidación marcada como pagada",
      data: liquidacion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error marcando liquidación como pagada",
      error: error.message,
    });
  }
};

const deleteSettlement = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { businessId, settlementId } = req.params;

    const liquidacion = await LiquidacionNegocio.findOne({
      _id: settlementId,
      usuario_id,
      negocio_id: businessId,
    });

    if (!liquidacion) {
      return res.status(404).json({
        message: "Liquidación no encontrada",
      });
    }

    await ProduccionNegocio.updateMany(
      {
        usuario_id,
        negocio_id: businessId,
        liquidacion_id: liquidacion._id,
      },
      {
        $set: {
          liquidacion_id: null,
        },
      }
    );

    await liquidacion.deleteOne();

    res.status(200).json({
      message: "Liquidación eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error eliminando liquidación",
      error: error.message,
    });
  }
};

module.exports = {
  createSettlement,
  getSettlements,
  getSettlementById,
  addSettlementPayment,
  markSettlementAsPaid,
  deleteSettlement,
};
