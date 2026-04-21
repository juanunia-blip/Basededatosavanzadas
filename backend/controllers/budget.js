const Presupuesto = require('../models/BudgetModel');
const Gasto = require('../models/ExpenseModel');

const addBudget = async (req, res) => {
  try {
    const { presupuesto_id, usuario_id, categoria_id, limite, mes } = req.body;

    if (!presupuesto_id || !usuario_id || !categoria_id || !mes) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (typeof limite !== 'number' || limite <= 0) {
      return res.status(400).json({ message: 'El límite debe ser mayor que cero' });
    }

    const exists = await Presupuesto.findOne({ presupuesto_id });
    if (exists) {
      return res.status(400).json({ message: 'El presupuesto_id ya existe' });
    }

    const presupuesto = new Presupuesto({
      presupuesto_id,
      usuario_id,
      categoria_id,
      limite,
      mes
    });

    await presupuesto.save();

    res.status(201).json({ message: 'Presupuesto creado correctamente', data: presupuesto });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear presupuesto', error: error.message });
  }
};

const getBudgets = async (req, res) => {
  try {
    const filtros = {};
    if (req.query.usuario_id) filtros.usuario_id = req.query.usuario_id;
    if (req.query.categoria_id) filtros.categoria_id = req.query.categoria_id;
    if (req.query.mes) filtros.mes = req.query.mes;

    const presupuestos = await Presupuesto.find(filtros).sort({ createdAt: -1 });
    res.status(200).json(presupuestos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener presupuestos', error: error.message });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const presupuesto = await Presupuesto.findByIdAndUpdate(id, req.body, { new: true });

    if (!presupuesto) {
      return res.status(404).json({ message: 'Presupuesto no encontrado' });
    }

    res.status(200).json({ message: 'Presupuesto actualizado correctamente', data: presupuesto });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar presupuesto', error: error.message });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const presupuesto = await Presupuesto.findByIdAndDelete(id);

    if (!presupuesto) {
      return res.status(404).json({ message: 'Presupuesto no encontrado' });
    }

    res.status(200).json({ message: 'Presupuesto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar presupuesto', error: error.message });
  }
};

const checkBudgetStatus = async (req, res) => {
  try {
    const { usuario_id, categoria_id, mes } = req.query;

    if (!usuario_id || !categoria_id || !mes) {
      return res.status(400).json({ message: 'usuario_id, categoria_id y mes son obligatorios' });
    }

    const presupuesto = await Presupuesto.findOne({ usuario_id, categoria_id, mes });

    if (!presupuesto) {
      return res.status(404).json({ message: 'Presupuesto no encontrado' });
    }

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
    if (monthIndex === undefined) {
      return res.status(400).json({ message: 'Mes inválido' });
    }

    const year = 2024;
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 1);

    const gastos = await Gasto.aggregate([
      {
        $match: {
          usuario_id,
          categoria_id,
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

    const totalGastado = gastos[0]?.total_gastado || 0;
    const porcentaje = presupuesto.limite > 0
      ? (totalGastado / presupuesto.limite) * 100
      : 0;

    res.status(200).json({
      usuario_id,
      categoria_id,
      mes,
      limite: presupuesto.limite,
      total_gastado: totalGastado,
      porcentaje_usado: porcentaje,
      estado:
        porcentaje >= 100
          ? 'Presupuesto excedido'
          : porcentaje >= 80
          ? 'Cerca del límite'
          : 'Dentro del presupuesto'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar presupuesto', error: error.message });
  }
};

const getBudgetAlerts = async (req, res) => {
  try {
    const { usuario_id, mes } = req.query;

    if (!usuario_id || !mes) {
      return res.status(400).json({ message: 'usuario_id y mes son obligatorios' });
    }

    const presupuestos = await Presupuesto.find({ usuario_id, mes });

    if (!presupuestos.length) {
      return res.status(200).json([]);
    }

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
    if (monthIndex === undefined) {
      return res.status(400).json({ message: 'Mes inválido' });
    }

    const year = 2024;
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 1);

    const alertas = [];

    for (const presupuesto of presupuestos) {
      const gastos = await Gasto.aggregate([
        {
          $match: {
            usuario_id: presupuesto.usuario_id,
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

      const totalGastado = gastos[0]?.total_gastado || 0;
      const porcentaje = presupuesto.limite > 0
        ? (totalGastado / presupuesto.limite) * 100
        : 0;

      let nivel = 'ok';
      let mensaje = 'Presupuesto en buen estado';

      if (porcentaje >= 100) {
        nivel = 'danger';
        mensaje = `Has excedido el presupuesto de ${presupuesto.categoria_id}`;
      } else if (porcentaje >= 80) {
        nivel = 'warning';
        mensaje = `Estás cerca del límite en ${presupuesto.categoria_id}`;
      }

      alertas.push({
        presupuesto_id: presupuesto.presupuesto_id,
        categoria_id: presupuesto.categoria_id,
        limite: presupuesto.limite,
        total_gastado: totalGastado,
        porcentaje_usado: Number(porcentaje.toFixed(2)),
        nivel,
        mensaje
      });
    }

    res.status(200).json(alertas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener alertas', error: error.message });
  }
};

module.exports = {
  addBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  checkBudgetStatus,
  getBudgetAlerts
};