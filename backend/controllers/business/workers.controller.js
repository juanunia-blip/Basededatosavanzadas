const TrabajadorNegocio = require("../../models/BusinessWorkerModel");

const { getUsuarioId, validarNegocio } = require("./helpers");

const addWorker = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { nombre, telefono, rol } = req.body;
    let { trabajador_id } = req.body;

    if (!nombre) {
      return res.status(400).json({
        message: "El nombre del trabajador es obligatorio",
      });
    }

    const negocio = await validarNegocio(req.params.businessId, usuario_id);

    if (!negocio) {
      return res.status(404).json({
        message: "Negocio no encontrado",
      });
    }

    if (!trabajador_id) {
      trabajador_id = `T${Date.now()}`;
    }

    const trabajador = await TrabajadorNegocio.create({
      usuario_id,
      negocio_id: negocio._id,
      trabajador_id,
      nombre: nombre.trim(),
      telefono: telefono || "",
      rol: rol || "",
      activo: true,
    });

    res.status(201).json({
      message: "Trabajador creado correctamente",
      data: trabajador,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear trabajador",
      error: error.message,
    });
  }
};

const getWorkers = async (req, res) => {
  try {
    const trabajadores = await TrabajadorNegocio.find({
      usuario_id: getUsuarioId(req),
      negocio_id: req.params.businessId,
    }).sort({ createdAt: -1 });

    res.status(200).json(trabajadores);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener trabajadores",
      error: error.message,
    });
  }
};

const updateWorker = async (req, res) => {
  try {
    const { businessId, workerId } = req.params;
    const usuario_id = getUsuarioId(req);

    delete req.body.usuario_id;
    delete req.body.negocio_id;

    const trabajador = await TrabajadorNegocio.findOneAndUpdate(
      {
        _id: workerId,
        negocio_id: businessId,
        usuario_id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!trabajador) {
      return res.status(404).json({
        message: "Trabajador no encontrado",
      });
    }

    res.status(200).json({
      message: "Trabajador actualizado correctamente",
      data: trabajador,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar trabajador",
      error: error.message,
    });
  }
};

const deleteWorker = async (req, res) => {
  try {
    const { businessId, workerId } = req.params;
    const usuario_id = getUsuarioId(req);

    const trabajador = await TrabajadorNegocio.findOneAndDelete({
      _id: workerId,
      negocio_id: businessId,
      usuario_id,
    });

    if (!trabajador) {
      return res.status(404).json({
        message: "Trabajador no encontrado",
      });
    }

    res.status(200).json({
      message: "Trabajador eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar trabajador",
      error: error.message,
    });
  }
};

module.exports = {
  addWorker,
  getWorkers,
  updateWorker,
  deleteWorker,
};
