const Presupuesto = require('../models/BudgetModel');

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

module.exports = {
  addBudget,
  getBudgets,
  updateBudget,
  deleteBudget
};