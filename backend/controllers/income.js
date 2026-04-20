const Ingreso = require('../models/IncomeModel');
const Usuario = require('../models/UserModel');

const addIncome = async (req, res) => {
  try {
    const { ingreso_id, usuario_id, fuente, monto, descripcion, fecha } = req.body;

    if (!ingreso_id || !usuario_id || !fuente || !descripcion || !fecha) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (typeof monto !== 'number' || monto <= 0) {
      return res.status(400).json({ message: 'El monto debe ser mayor que cero' });
    }

    const exists = await Ingreso.findOne({ ingreso_id });
    if (exists) {
      return res.status(400).json({ message: 'El ingreso_id ya existe' });
    }

    const userExists = await Usuario.findOne({ usuario_id });
    if (!userExists) {
      return res.status(400).json({ message: 'Usuario no existe' });
    }

    const ingreso = new Ingreso({
      ingreso_id,
      usuario_id,
      fuente,
      monto,
      descripcion,
      fecha
    });

    await ingreso.save();

    res.status(201).json({ message: 'Ingreso creado correctamente', data: ingreso });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear ingreso', error: error.message });
  }
};

const getIncomes = async (req, res) => {
  try {
    const filtros = {};

    if (req.query.usuario_id) filtros.usuario_id = req.query.usuario_id;

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

    const ingresos = await Ingreso.find(filtros).sort({ fecha: -1 });

    res.status(200).json(ingresos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ingresos', error: error.message });
  }
};

const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const ingreso = await Ingreso.findByIdAndUpdate(id, req.body, { new: true });

    if (!ingreso) {
      return res.status(404).json({ message: 'Ingreso no encontrado' });
    }

    res.status(200).json({ message: 'Ingreso actualizado', data: ingreso });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar ingreso', error: error.message });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const ingreso = await Ingreso.findByIdAndDelete(id);

    if (!ingreso) {
      return res.status(404).json({ message: 'Ingreso no encontrado' });
    }

    res.status(200).json({ message: 'Ingreso eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar ingreso', error: error.message });
  }
};

module.exports = {
  addIncome,
  getIncomes,
  updateIncome,
  deleteIncome
};