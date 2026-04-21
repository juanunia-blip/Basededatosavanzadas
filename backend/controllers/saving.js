const Ahorro = require('../models/SavingModel');
const Usuario = require('../models/UserModel');

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

    const userExists = await Usuario.findOne({ usuario_id });
    if (!userExists) {
      return res.status(400).json({ message: 'Usuario no existe' });
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

const savingProgress = async (req, res) => {
  try {
    const { usuario_id } = req.query;

    const filtros = {};
    if (usuario_id) filtros.usuario_id = usuario_id;

    const ahorros = await Ahorro.find(filtros);

    const resultado = ahorros.map(item => ({
      ahorro_id: item.ahorro_id,
      usuario_id: item.usuario_id,
      meta: item.meta,
      monto_objetivo: item.monto_objetivo,
      monto_actual: item.monto_actual,
      porcentaje: item.monto_objetivo > 0
        ? Number(((item.monto_actual / item.monto_objetivo) * 100).toFixed(2))
        : 0
    }));

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener progreso de ahorro', error: error.message });
  }
};

const savingAlert = async (req, res) => {
  try {
    const { usuario_id } = req.query;

    if (!usuario_id) {
      return res.status(400).json({ message: 'usuario_id es obligatorio' });
    }

    const ahorros = await Ahorro.find({ usuario_id });

    const resultados = ahorros.map(a => {
      const progreso = a.monto_objetivo > 0
        ? (a.monto_actual / a.monto_objetivo) * 100
        : 0;

      let nivel = 'ok';
      let mensaje = 'Buen progreso';

      if (progreso < 30) {
        nivel = 'warning';
        mensaje = `Bajo progreso en meta: ${a.meta}`;
      } else if (progreso >= 100) {
        nivel = 'success';
        mensaje = `Meta alcanzada: ${a.meta}`;
      }

      return {
        ahorro_id: a.ahorro_id,
        meta: a.meta,
        progreso: Number(progreso.toFixed(2)),
        nivel,
        mensaje
      };
    });

    res.status(200).json(resultados);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener alerta de ahorro', error: error.message });
  }
};

module.exports = {
  addSaving,
  getSavings,
  updateSaving,
  deleteSaving,
  savingProgress,
  savingAlert
};