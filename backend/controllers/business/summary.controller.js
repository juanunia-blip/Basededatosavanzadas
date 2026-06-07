const VentaNegocio = require("../../models/BusinessSaleModel");
const GastoNegocio = require("../../models/BusinessExpenseModel");
const ProduccionNegocio = require("../../models/BusinessProductionModel");
const LiquidacionNegocio = require("../../models/BusinessSettlementModel");

const { getUsuarioId, validarNegocio } = require("./helpers");

/* =========================
   SUMMARY
========================= */

const getBusinessSummary = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const negocio_id = req.params.businessId;

    const negocio = await validarNegocio(negocio_id, usuario_id);

    if (!negocio) {
      return res.status(404).json({
        message: "Negocio no encontrado",
      });
    }

    const [ventas, gastos, liquidaciones, produccionesSinLiquidar] =
      await Promise.all([
        VentaNegocio.find({
          usuario_id,
          negocio_id,
        }),

        GastoNegocio.find({
          usuario_id,
          negocio_id,
        }),

        /*
          Regla contable:
          Las liquidaciones anuladas NO cuentan para:
          - gastos de trabajadores
          - deuda pendiente
          - utilidad neta
          - total abonado
        */
        LiquidacionNegocio.find({
          usuario_id,
          negocio_id,
          anulada: { $ne: true },
        }),

        ProduccionNegocio.find({
          usuario_id,
          negocio_id,
          liquidacion_id: null,
        }),
      ]);

    const totalVentas = ventas.reduce(
      (sum, item) => sum + Number(item.total_venta || 0),
      0
    );

    const totalGastos = gastos.reduce(
      (sum, item) => sum + Number(item.monto || 0),
      0
    );

    /*
      Regla correcta:
      Solo cuenta dinero realmente pagado o abonado.
      No usamos total_pago porque eso incluye deuda no pagada.
    */
    const totalPagoTrabajadores = liquidaciones.reduce(
      (sum, item) => sum + Number(item.abonado || 0),
      0
    );

    const totalAbonado = totalPagoTrabajadores;

    const totalPendiente = liquidaciones.reduce(
      (sum, item) => sum + Number(item.pendiente || 0),
      0
    );

    const totalKilosSinLiquidar = produccionesSinLiquidar.reduce(
      (sum, item) => sum + Number(item.kilos || 0),
      0
    );

    const totalPagoSinLiquidar = produccionesSinLiquidar.reduce(
      (sum, item) => sum + Number(item.total_pago || 0),
      0
    );

    const totalGastosConTrabajadores =
      Number(totalGastos || 0) + Number(totalPagoTrabajadores || 0);

    const utilidadNeta =
      Number(totalVentas || 0) - Number(totalGastosConTrabajadores || 0);

    res.status(200).json({
      negocio,
      resumen: {
        totalVentas,

        // Gastos operativos manuales.
        totalGastos,

        // Pagos reales a trabajadores desde liquidaciones activas.
        totalPagoTrabajadores,
        totalAbonado,
        totalPendiente,

        // Total contable usado para utilidad.
        totalGastosConTrabajadores,

        // Producción que todavía no está en una liquidación activa.
        totalKilosSinLiquidar,
        totalPagoSinLiquidar,

        utilidadNeta,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al generar resumen del negocio",
      error: error.message,
    });
  }
};

module.exports = {
  getBusinessSummary,
};