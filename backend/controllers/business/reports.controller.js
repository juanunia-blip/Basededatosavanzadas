const TrabajadorNegocio = require("../../models/BusinessWorkerModel");
const ProduccionNegocio = require("../../models/BusinessProductionModel");
const GastoNegocio = require("../../models/BusinessExpenseModel");
const VentaNegocio = require("../../models/BusinessSaleModel");
const LiquidacionNegocio = require("../../models/BusinessSettlementModel");

const {
  getUsuarioId,
  validarNegocio,
  getMonthKey,
  addToPeriod,
} = require("./helpers");

/* =========================
   REPORTS
========================= */

const getBusinessReports = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const negocio_id = req.params.businessId;

    const negocio = await validarNegocio(negocio_id, usuario_id);

    if (!negocio) {
      return res.status(404).json({
        message: "Negocio no encontrado",
      });
    }

    const [ventas, gastos, liquidaciones, producciones, trabajadores] =
      await Promise.all([
        VentaNegocio.find({
          usuario_id,
          negocio_id,
        }).sort({ fecha: -1 }),

        GastoNegocio.find({
          usuario_id,
          negocio_id,
        }).sort({ fecha: -1 }),

        /*
          Traemos todas para historial, pero para cálculos usamos solo activas.
        */
        LiquidacionNegocio.find({
          usuario_id,
          negocio_id,
        }).sort({ fecha_inicio: -1 }),

        ProduccionNegocio.find({
          usuario_id,
          negocio_id,
        }).sort({ fecha: -1 }),

        TrabajadorNegocio.find({
          usuario_id,
          negocio_id,
        }),
      ]);

    const liquidacionesActivas = liquidaciones.filter(
      (item) => !item.anulada
    );

    const liquidacionesAnuladas = liquidaciones.filter(
      (item) => item.anulada
    );

    const totalVentas = ventas.reduce(
      (sum, item) => sum + Number(item.total_venta || 0),
      0
    );

    const totalGastosOperativos = gastos.reduce(
      (sum, item) => sum + Number(item.monto || 0),
      0
    );

    /*
      Regla contable:
      Trabajadores = dinero realmente abonado/pagado en liquidaciones activas.
    */
    const totalGastosTrabajadores = liquidacionesActivas.reduce(
      (sum, item) => sum + Number(item.abonado || 0),
      0
    );

    const totalGastos =
      Number(totalGastosOperativos || 0) +
      Number(totalGastosTrabajadores || 0);

    const utilidadNeta = Number(totalVentas || 0) - Number(totalGastos || 0);

    const totalKilosVendidos = ventas.reduce(
      (sum, item) => sum + Number(item.kilos || item.cantidad || 0),
      0
    );

    const totalKilosProducidos = producciones.reduce(
      (sum, item) => sum + Number(item.kilos || 0),
      0
    );

    const produccionesSinLiquidar = producciones.filter(
      (item) => !item.liquidacion_id
    );

    const totalKilosSinLiquidar = produccionesSinLiquidar.reduce(
      (sum, item) => sum + Number(item.kilos || 0),
      0
    );

    const totalPagoSinLiquidar = produccionesSinLiquidar.reduce(
      (sum, item) => sum + Number(item.total_pago || 0),
      0
    );

    const totalLiquidado = liquidacionesActivas.reduce(
      (sum, item) => sum + Number(item.total_pago || 0),
      0
    );

    const totalAbonado = liquidacionesActivas.reduce(
      (sum, item) => sum + Number(item.abonado || 0),
      0
    );

    const totalPendienteTrabajadores = liquidacionesActivas.reduce(
      (sum, item) => sum + Number(item.pendiente || 0),
      0
    );

    const trabajadoresActivos = trabajadores.filter(
      (item) => item.activo !== false
    ).length;

    const ventasPorProductoMap = {};

    ventas.forEach((venta) => {
      const producto = venta.producto || "Sin producto";

      if (!ventasPorProductoMap[producto]) {
        ventasPorProductoMap[producto] = {
          producto,
          kilos: 0,
          cantidad: 0,
          total: 0,
          ventas: 0,
        };
      }

      ventasPorProductoMap[producto].kilos += Number(
        venta.kilos || venta.cantidad || 0
      );

      ventasPorProductoMap[producto].cantidad += Number(
        venta.cantidad || venta.kilos || 0
      );

      ventasPorProductoMap[producto].total += Number(venta.total_venta || 0);
      ventasPorProductoMap[producto].ventas += 1;
    });

    const gastosPorTipoMap = {};

    gastos.forEach((gasto) => {
      const tipo = gasto.tipo || "otro";

      if (!gastosPorTipoMap[tipo]) {
        gastosPorTipoMap[tipo] = {
          tipo,
          total: 0,
          registros: 0,
        };
      }

      gastosPorTipoMap[tipo].total += Number(gasto.monto || 0);
      gastosPorTipoMap[tipo].registros += 1;
    });

    if (totalGastosTrabajadores > 0) {
      gastosPorTipoMap.trabajadores = {
        tipo: "trabajadores",
        total: totalGastosTrabajadores,
        registros: liquidacionesActivas.filter(
          (item) => Number(item.abonado || 0) > 0
        ).length,
        calculado: true,
      };
    }

    const produccionPorTrabajadorMap = {};

    producciones.forEach((produccion) => {
      const trabajadorId =
        produccion.trabajador_id?.toString?.() ||
        produccion.trabajador_id ||
        "sin_trabajador";

      const nombre = produccion.trabajador_nombre || "Sin trabajador";

      if (!produccionPorTrabajadorMap[trabajadorId]) {
        produccionPorTrabajadorMap[trabajadorId] = {
          trabajador_id: trabajadorId,
          trabajador_nombre: nombre,
          kilos: 0,
          total_pago: 0,
          registros: 0,
          sinLiquidar: 0,
        };
      }

      produccionPorTrabajadorMap[trabajadorId].kilos += Number(
        produccion.kilos || 0
      );

      produccionPorTrabajadorMap[trabajadorId].total_pago += Number(
        produccion.total_pago || 0
      );

      produccionPorTrabajadorMap[trabajadorId].registros += 1;

      if (!produccion.liquidacion_id) {
        produccionPorTrabajadorMap[trabajadorId].sinLiquidar += 1;
      }
    });

    const detalleMensualMap = {};

    ventas.forEach((venta) => {
      addToPeriod(detalleMensualMap, getMonthKey(venta.fecha), {
        ventas: Number(venta.total_venta || 0),
        kilosVendidos: Number(venta.kilos || venta.cantidad || 0),
      });
    });

    gastos.forEach((gasto) => {
      addToPeriod(detalleMensualMap, getMonthKey(gasto.fecha), {
        gastosOperativos: Number(gasto.monto || 0),
      });
    });

    /*
      Solo liquidaciones activas cuentan como gasto de trabajadores por mes.
    */
    liquidacionesActivas.forEach((liquidacion) => {
      addToPeriod(detalleMensualMap, getMonthKey(liquidacion.fecha_fin), {
        gastosTrabajadores: Number(liquidacion.abonado || 0),
        liquidaciones: 1,
      });
    });

    producciones.forEach((produccion) => {
      addToPeriod(detalleMensualMap, getMonthKey(produccion.fecha), {
        kilosProducidos: Number(produccion.kilos || 0),
        producciones: 1,
      });
    });

    const detalleMensual = Object.values(detalleMensualMap).sort((a, b) =>
      b.periodo.localeCompare(a.periodo)
    );

    const ventasPorProducto = Object.values(ventasPorProductoMap).sort(
      (a, b) => b.total - a.total
    );

    const gastosPorTipo = Object.values(gastosPorTipoMap).sort(
      (a, b) => b.total - a.total
    );

    const produccionPorTrabajador = Object.values(
      produccionPorTrabajadorMap
    ).sort((a, b) => b.total_pago - a.total_pago);

    res.status(200).json({
      negocio,
      reporte: {
        resumen: {
          totalVentas,
          totalGastosOperativos,
          totalGastosTrabajadores,
          totalGastos,
          utilidadNeta,

          totalKilosVendidos,
          totalKilosProducidos,

          totalKilosSinLiquidar,
          totalPagoSinLiquidar,

          totalLiquidado,
          totalAbonado,
          totalPendienteTrabajadores,

          trabajadoresActivos,
          totalTrabajadores: trabajadores.length,

          liquidaciones: {
            total: liquidacionesActivas.length,
            anuladas: liquidacionesAnuladas.length,
            pagadas: liquidacionesActivas.filter(
              (item) => item.estado === "pagado"
            ).length,
            abonadas: liquidacionesActivas.filter(
              (item) => item.estado === "abonado"
            ).length,
            pendientes: liquidacionesActivas.filter(
              (item) => item.estado === "pendiente"
            ).length,
          },

          registros: {
            ventas: ventas.length,
            gastos: gastos.length,
            producciones: producciones.length,
            liquidaciones: liquidacionesActivas.length,
            liquidacionesAnuladas: liquidacionesAnuladas.length,
          },
        },

        ventasPorProducto,
        gastosPorTipo,
        produccionPorTrabajador,
        detalleMensual,

        ultimosMovimientos: {
          ventas: ventas.slice(0, 5),
          gastos: gastos.slice(0, 5),

          /*
            Para historial visual podemos mostrar todas,
            incluso anuladas.
          */
          liquidaciones: liquidaciones.slice(0, 5),

          producciones: producciones.slice(0, 5),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error generando reporte del negocio",
      error: error.message,
    });
  }
};

module.exports = {
  getBusinessReports,
};