const Gasto = require('../models/ExpenseModel');
const Usuario = require('../models/UserModel');
const Categoria = require('../models/CategoryModel');

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

    const userExists = await Usuario.findOne({ usuario_id });
    if (!userExists) {
      return res.status(400).json({ message: 'Usuario no existe' });
    }

    const categoryExists = await Categoria.findOne({ categoria_id });
    if (!categoryExists) {
      return res.status(400).json({ message: 'Categoria no existe' });
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

    if (req.query.min || req.query.max) {
      filtros.monto = {};
      if (req.query.min) filtros.monto.$gte = Number(req.query.min);
      if (req.query.max) filtros.monto.$lte = Number(req.query.max);
    }

    if (req.query.fecha_inicio || req.query.fecha_fin) {
      filtros.fecha = {};
      if (req.query.fecha_inicio) filtros.fecha.$gte = new Date(req.query.fecha_inicio);
      if (req.query.fecha_fin) filtros.fecha.$lte = new Date(req.query.fecha_fin);
    }

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

const totalByUser = async (req, res) => {
  try {
    const data = await Gasto.aggregate([
      {
        $group: {
          _id: '$usuario_id',
          total_gastado: { $sum: '$monto' }
        }
      }
    ]);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const averageByCategory = async (req, res) => {
  try {
    const data = await Gasto.aggregate([
      {
        $group: {
          _id: '$categoria_id',
          promedio: { $avg: '$monto' }
        }
      }
    ]);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const highExpenses = async (req, res) => {
  try {
    const min = Number(req.query.min || 50);
    const data = await Gasto.find({ monto: { $gt: min } }).sort({ monto: -1 });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const generalReport = async (req, res) => {
  try {
    const data = await Gasto.aggregate([
      {
        $group: {
          _id: '$categoria_id',
          total: { $sum: '$monto' },
          cantidad: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  totalByUser,
  averageByCategory,
  highExpenses,
  generalReport
};