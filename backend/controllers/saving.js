const Ahorro = require('../models/SavingModel');

const addSaving = async (req, res) => {
  try {
    const { ahorro_id, usuario_id, meta, monto_objetivo, monto_actual } = req.body;

    if (!ahorro_id || !usuario_id || !meta) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (
      typeof monto_objetivo !== 'number' || monto_objetivo <= 0 ||
      typeof monto_actual !== 'number' || monto_actual < 0
    ) {
      return res.status(400).json({ message: 'Montos inválidos' });
    }

    const exists = await Ahorro.findOne({ ahorro_id });
    if (exists) {
      return res.status(400).json({ message: 'El ahorro_id ya existe' });
    }

    const ahorro = new Ahorro({
      ahorro_id,
      usuario_id,
      meta,
      monto_objetivo,
      monto_actual
    });

    await ahorro.save();

    res.status(201).json({ message: 'Ahorro creado correctamente', data: ahorro });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear ahorro', error: error.message });
  }
};

const getSavings = async (req, res) => {
  try {
    const filtros = {};
    if (req.query.usuario_id) filtros.usuario_id = req.query.usuario_id;

    const ahorros = await Ahorro.find(filtros).sort({ createdAt: -1 });
    res.status(200).json(ahorros);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ahorros', error: error.message });
  }
};

const updateSaving = async (req, res) => {
  try {
    const { id } = req.params;

    const ahorro = await Ahorro.findByIdAndUpdate(id, req.body, { new: true });

    if (!ahorro) {
      return res.status(404).json({ message: 'Ahorro no encontrado' });
    }

    res.status(200).json({ message: 'Ahorro actualizado correctamente', data: ahorro });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar ahorro', error: error.message });
  }
};

const deleteSaving = async (req, res) => {
  try {
    const { id } = req.params;

    const ahorro = await Ahorro.findByIdAndDelete(id);

    if (!ahorro) {
      return res.status(404).json({ message: 'Ahorro no encontrado' });
    }

    res.status(200).json({ message: 'Ahorro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar ahorro', error: error.message });
  }
};

module.exports = {
  addSaving,
  getSavings,
  updateSaving,
  deleteSaving
};