const Gasto = require('../models/ExpenseModel');

const addExpense = async (req, res) => {
  try {
    const { gasto_id, usuario_id, categoria_id, monto, descripcion, fecha } = req.body;

    if (!gasto_id || !usuario_id || !categoria_id || !descripcion || !fecha) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (typeof monto !== 'number' || monto <= 0) {
      return res.status(400).json({ message: 'El monto debe ser mayor que cero' });
    }

    const exists = await Gasto.findOne({ gasto_id });
    if (exists) {
      return res.status(400).json({ message: 'El gasto_id ya existe' });
    }

    const gasto = new Gasto({
      gasto_id,
      usuario_id,
      categoria_id,
      monto,
      descripcion,
      fecha
    });

    await gasto.save();

    res.status(201).json({ message: 'Gasto creado correctamente', data: gasto });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear gasto', error: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const filtros = {};
    if (req.query.usuario_id) filtros.usuario_id = req.query.usuario_id;
    if (req.query.categoria_id) filtros.categoria_id = req.query.categoria_id;

    const gastos = await Gasto.find(filtros).sort({ fecha: -1 });
    res.status(200).json(gastos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener gastos', error: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const gasto = await Gasto.findByIdAndUpdate(id, req.body, { new: true });

    if (!gasto) {
      return res.status(404).json({ message: 'Gasto no encontrado' });
    }

    res.status(200).json({ message: 'Gasto actualizado correctamente', data: gasto });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar gasto', error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const gasto = await Gasto.findByIdAndDelete(id);

    if (!gasto) {
      return res.status(404).json({ message: 'Gasto no encontrado' });
    }

    res.status(200).json({ message: 'Gasto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar gasto', error: error.message });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense
};