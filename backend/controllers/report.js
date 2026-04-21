const Gasto = require('../models/ExpenseModel');
const Ingreso = require('../models/IncomeModel');
const Ahorro = require('../models/SavingModel');
const Presupuesto = require('../models/BudgetModel');

const balanceAlert = async (req, res) => {
  try {
    const { usuario_id } = req.query;

    if (!usuario_id) {
      return res.status(400).json({ message: 'usuario_id es obligatorio' });
    }

    const ingresos = await Ingreso.aggregate([
      { $match: { usuario_id } },
      { $group: { _id: null, total: { $sum: '$monto' } } }
    ]);

    const gastos = await Gasto.aggregate([
      { $match: { usuario_id } },
      { $group: { _id: null, total: { $sum: '$monto' } } }
    ]);

    const totalIngresos = ingresos[0]?.total || 0;
    const totalGastos = gastos[0]?.total || 0;
    const balance = totalIngresos - totalGastos;

    let nivel = 'ok';
    let mensaje = 'Balance positivo';

    if (balance < 0) {
      nivel = 'danger';
      mensaje = 'Estás gastando más de lo que ganas';
    } else if (balance === 0) {
      nivel = 'warning';
      mensaje = 'Tu balance está en cero';
    }

    res.status(200).json({
      usuario_id,
      total_ingresos: totalIngresos,
      total_gastos: totalGastos,
      balance,
      nivel,
      mensaje
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener alerta de balance', error: error.message });
  }
};

const financialStatus = async (req, res) => {
  try {
    const { usuario_id, mes } = req.query;

    if (!usuario_id) {
      return res.status(400).json({ message: 'usuario_id es obligatorio' });
    }

    const ingresosAgg = await Ingreso.aggregate([
      { $match: { usuario_id } },
      {
        $group: {
          _id: null,
          total_ingresos: { $sum: '$monto' }
        }
      }
    ]);

    const gastosAgg = await Gasto.aggregate([
      { $match: { usuario_id } },
      {
        $group: {
          _id: null,
          total_gastos: { $sum: '$monto' }
        }
      }
    ]);

    const ahorrosAgg = await Ahorro.aggregate([
      { $match: { usuario_id } },
      {
        $group: {
          _id: null,
          total_ahorro_actual: { $sum: '$monto_actual' },
          total_ahorro_objetivo: { $sum: '$monto_objetivo' }
        }
      }
    ]);

    const totalIngresos = ingresosAgg[0]?.total_ingresos || 0;
    const totalGastos = gastosAgg[0]?.total_gastos || 0;
    const totalAhorroActual = ahorrosAgg[0]?.total_ahorro_actual || 0;
    const totalAhorroObjetivo = ahorrosAgg[0]?.total_ahorro_objetivo || 0;

    const balance = totalIngresos - totalGastos;
    const tasaAhorro = totalIngresos > 0
      ? (totalAhorroActual / totalIngresos) * 100
      : 0;

    let presupuestosExcedidos = 0;
    let presupuestosCercaLimite = 0;

    if (mes) {
      const presupuestos = await Presupuesto.find({ usuario_id, mes });

      const meses = {
        Enero: 0,
        Febrero: 1,
        Marzo: 2,
        Abril: 3,
        Mayo: 4,
        Junio: 5,
        Julio: 6,
        Agosto: 7,
        Septiembre: 8,
        Octubre: 9,
        Noviembre: 10,
        Diciembre: 11
      };

      const monthIndex = meses[mes];

      if (monthIndex !== undefined) {
        const year = 2024;
        const start = new Date(year, monthIndex, 1);
        const end = new Date(year, monthIndex + 1, 1);

        for (const presupuesto of presupuestos) {
          const gastoMes = await Gasto.aggregate([
            {
              $match: {
                usuario_id,
                categoria_id: presupuesto.categoria_id,
                fecha: { $gte: start, $lt: end }
              }
            },
            {
              $group: {
                _id: null,
                total_gastado: { $sum: '$monto' }
              }
            }
          ]);

          const totalGastado = gastoMes[0]?.total_gastado || 0;
          const porcentaje = presupuesto.limite > 0
            ? (totalGastado / presupuesto.limite) * 100
            : 0;

          if (porcentaje >= 100) {
            presupuestosExcedidos += 1;
          } else if (porcentaje >= 80) {
            presupuestosCercaLimite += 1;
          }
        }
      }
    }

    let estado = 'estable';
    let mensaje = 'Situación financiera estable';

    if (balance < 0 && presupuestosExcedidos > 0) {
      estado = 'critico';
      mensaje = 'Tus gastos superan tus ingresos y además excediste presupuestos';
    } else if (balance < 0 || presupuestosExcedidos > 0) {
      estado = 'en_riesgo';
      mensaje = 'Tu situación financiera requiere atención';
    } else if (balance > 0 && tasaAhorro >= 20 && presupuestosExcedidos === 0 && presupuestosCercaLimite === 0) {
      estado = 'saludable';
      mensaje = 'Tus finanzas muestran un comportamiento saludable';
    }

    res.status(200).json({
      usuario_id,
      mes: mes || null,
      total_ingresos: Number(totalIngresos.toFixed(2)),
      total_gastos: Number(totalGastos.toFixed(2)),
      balance: Number(balance.toFixed(2)),
      total_ahorro_actual: Number(totalAhorroActual.toFixed(2)),
      total_ahorro_objetivo: Number(totalAhorroObjetivo.toFixed(2)),
      tasa_ahorro: Number(tasaAhorro.toFixed(2)),
      presupuestos_excedidos: presupuestosExcedidos,
      presupuestos_cerca_limite: presupuestosCercaLimite,
      estado,
      mensaje
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estado financiero', error: error.message });
  }
};

module.exports = {
  balanceAlert,
  financialStatus
};