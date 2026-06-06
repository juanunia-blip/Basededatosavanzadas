const ProduccionNegocio = require("../../models/BusinessProductionModel");
const GastoNegocio = require("../../models/BusinessExpenseModel");
const VentaNegocio = require("../../models/BusinessSaleModel");
const LiquidacionNegocio = require("../../models/BusinessSettlementModel");

const { getUsuarioId, validarNegocio } = require("./helpers");

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
        VentaNegocio.find({ usuario_id, negocio_id }),
        GastoNegocio.find({ usuario_id, negocio_id }),
        LiquidacionNegocio.find({ usuario_id, negocio_id }),
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
      totalGastos + totalPagoTrabajadores;

    const utilidadNeta =
      totalVentas - totalGastosConTrabajadores;

    res.status(200).json({
      negocio,
      resumen: {
        totalVentas,

        // Gastos operativos manuales.
        totalGastos,

        // Pagos reales a trabajadores desde liquidaciones abonadas o pagadas.
        totalPagoTrabajadores,
        totalAbonado,
        totalPendiente,

        // Total visual/contable para mostrar "gastos del negocio".
        totalGastosConTrabajadores,

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
