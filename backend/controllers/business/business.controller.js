const Negocio = require("../../models/BusinessModel");
const TrabajadorNegocio = require("../../models/BusinessWorkerModel");
const ProduccionNegocio = require("../../models/BusinessProductionModel");
const GastoNegocio = require("../../models/BusinessExpenseModel");
const VentaNegocio = require("../../models/BusinessSaleModel");
const LiquidacionNegocio = require("../../models/BusinessSettlementModel");

const { getUsuarioId } = require("./helpers");

const createBusiness = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { nombre, tipo, ciudad, descripcion } = req.body;

    if (!nombre || !tipo) {
      return res.status(400).json({
        message: "Nombre y tipo son obligatorios",
      });
    }

    const exists = await Negocio.findOne({
      usuario_id,
      nombre: nombre.trim(),
    });

    if (exists) {
      return res.status(400).json({
        message: "Ya tienes un negocio con ese nombre",
      });
    }

    const negocio = await Negocio.create({
      usuario_id,
      nombre: nombre.trim(),
      tipo,
      ciudad: ciudad || "",
      descripcion: descripcion || "",
      activo: true,
    });

    res.status(201).json({
      message: "Negocio creado correctamente",
      data: negocio,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear negocio",
      error: error.message,
    });
  }
};

const getBusinesses = async (req, res) => {
  try {
    const negocios = await Negocio.find({
      usuario_id: getUsuarioId(req),
    }).sort({ createdAt: -1 });

    res.status(200).json(negocios);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener negocios",
      error: error.message,
    });
  }
};

const getBusinessById = async (req, res) => {
  try {
    const negocio = await Negocio.findOne({
      _id: req.params.id,
      usuario_id: getUsuarioId(req),
    });

    if (!negocio) {
      return res.status(404).json({
        message: "Negocio no encontrado",
      });
    }

    res.status(200).json(negocio);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener negocio",
      error: error.message,
    });
  }
};

const updateBusiness = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);

    delete req.body.usuario_id;

    const negocio = await Negocio.findOneAndUpdate(
      {
        _id: req.params.id,
        usuario_id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!negocio) {
      return res.status(404).json({
        message: "Negocio no encontrado",
      });
    }

    res.status(200).json({
      message: "Negocio actualizado correctamente",
      data: negocio,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar negocio",
      error: error.message,
    });
  }
};

const deleteBusiness = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);

    const negocio = await Negocio.findOneAndDelete({
      _id: req.params.id,
      usuario_id,
    });

    if (!negocio) {
      return res.status(404).json({
        message: "Negocio no encontrado",
      });
    }

    await Promise.all([
      TrabajadorNegocio.deleteMany({ usuario_id, negocio_id: req.params.id }),
      ProduccionNegocio.deleteMany({ usuario_id, negocio_id: req.params.id }),
      GastoNegocio.deleteMany({ usuario_id, negocio_id: req.params.id }),
      VentaNegocio.deleteMany({ usuario_id, negocio_id: req.params.id }),
      LiquidacionNegocio.deleteMany({ usuario_id, negocio_id: req.params.id }),
    ]);

    res.status(200).json({
      message: "Negocio eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar negocio",
      error: error.message,
    });
  }
};

module.exports = {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
};
