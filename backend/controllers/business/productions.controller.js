const TrabajadorNegocio = require("../../models/BusinessWorkerModel");
const ProduccionNegocio = require("../../models/BusinessProductionModel");

const { getUsuarioId, validarNegocio } = require("./helpers");

const addProduction = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);

    const { trabajador_id, fecha, kilos, precio_kilo, abonado, observacion } =
      req.body;

    if (
      !trabajador_id ||
      !fecha ||
      kilos === undefined ||
      precio_kilo === undefined
    ) {
      return res.status(400).json({
        message: "trabajador_id, fecha, kilos y precio_kilo son obligatorios",
      });
    }

    const negocio = await validarNegocio(req.params.businessId, usuario_id);

    if (!negocio) {
      return res.status(404).json({
        message: "Negocio no encontrado",
      });
    }

    const trabajador = await TrabajadorNegocio.findOne({
      _id: trabajador_id,
      usuario_id,
      negocio_id: negocio._id,
    });

    if (!trabajador) {
      return res.status(404).json({
        message: "Trabajador no encontrado",
      });
    }

    const produccion = await ProduccionNegocio.create({
      usuario_id,
      negocio_id: negocio._id,
      trabajador_id: trabajador._id,
      trabajador_nombre: trabajador.nombre,
      fecha,
      kilos: Number(kilos),
      precio_kilo: Number(precio_kilo),
      abonado: Number(abonado || 0),
      observacion: observacion || "",
      liquidacion_id: null,
    });

    res.status(201).json({
      message: "Producción registrada correctamente",
      data: produccion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al registrar producción",
      error: error.message,
    });
  }
};

const getProductions = async (req, res) => {
  try {
    const producciones = await ProduccionNegocio.find({
      usuario_id: getUsuarioId(req),
      negocio_id: req.params.businessId,
    }).sort({ fecha: -1 });

    res.status(200).json(producciones);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener producciones",
      error: error.message,
    });
  }
};

const updateProduction = async (req, res) => {
  try {
    const { businessId, productionId } = req.params;
    const usuario_id = getUsuarioId(req);

    delete req.body.usuario_id;
    delete req.body.negocio_id;
    delete req.body.liquidacion_id;

    const produccionExistente = await ProduccionNegocio.findOne({
      _id: productionId,
      negocio_id: businessId,
      usuario_id,
    });

    if (!produccionExistente) {
      return res.status(404).json({
        message: "Producción no encontrada",
      });
    }

    if (produccionExistente.liquidacion_id) {
      return res.status(400).json({
        message:
          "No puedes editar una producción que ya pertenece a una liquidación. Elimina la liquidación primero.",
      });
    }

    if (req.body.kilos !== undefined) req.body.kilos = Number(req.body.kilos);
    if (req.body.precio_kilo !== undefined)
      req.body.precio_kilo = Number(req.body.precio_kilo);
    if (req.body.abonado !== undefined)
      req.body.abonado = Number(req.body.abonado);

    const produccion = await ProduccionNegocio.findOneAndUpdate(
      {
        _id: productionId,
        negocio_id: businessId,
        usuario_id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Producción actualizada correctamente",
      data: produccion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar producción",
      error: error.message,
    });
  }
};

const deleteProduction = async (req, res) => {
  try {
    const { businessId, productionId } = req.params;
    const usuario_id = getUsuarioId(req);

    const produccion = await ProduccionNegocio.findOne({
      _id: productionId,
      negocio_id: businessId,
      usuario_id,
    });

    if (!produccion) {
      return res.status(404).json({
        message: "Producción no encontrada",
      });
    }

    if (produccion.liquidacion_id) {
      return res.status(400).json({
        message:
          "No puedes eliminar una producción que ya pertenece a una liquidación. Elimina la liquidación primero.",
      });
    }

    await produccion.deleteOne();

    res.status(200).json({
      message: "Producción eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar producción",
      error: error.message,
    });
  }
};

const addProductionPayment = async (req, res) => {
  try {
    const { businessId, productionId } = req.params;
    const usuario_id = getUsuarioId(req);
    const aporte = Number(req.body.monto);

    if (isNaN(aporte) || aporte <= 0) {
      return res.status(400).json({
        message: "El abono debe ser mayor que cero",
      });
    }

    const produccion = await ProduccionNegocio.findOne({
      _id: productionId,
      negocio_id: businessId,
      usuario_id,
    });

    if (!produccion) {
      return res.status(404).json({
        message: "Producción no encontrada",
      });
    }

    if (produccion.liquidacion_id) {
      return res.status(400).json({
        message:
          "Esta producción ya pertenece a una liquidación. Realiza el abono sobre la liquidación.",
      });
    }

    produccion.abonado = Number(produccion.abonado || 0) + aporte;

    if (produccion.abonado > produccion.total_pago) {
      produccion.abonado = produccion.total_pago;
    }

    produccion.pendiente =
      Number(produccion.total_pago || 0) - Number(produccion.abonado || 0);

    if (produccion.abonado <= 0) {
      produccion.estado = "pendiente";
    } else if (produccion.abonado < produccion.total_pago) {
      produccion.estado = "abonado";
    } else {
      produccion.estado = "pagado";
    }

    await produccion.save();

    res.status(200).json({
      message: "Abono registrado correctamente",
      data: produccion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al registrar abono",
      error: error.message,
    });
  }
};

const getUnsettledProductions = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { businessId } = req.params;
    const { trabajador_id, fecha_inicio, fecha_fin } = req.query;

    const query = {
      usuario_id,
      negocio_id: businessId,
      liquidacion_id: null,
    };

    if (trabajador_id) {
      query.trabajador_id = trabajador_id;
    }

    if (fecha_inicio || fecha_fin) {
      query.fecha = {};

      if (fecha_inicio) query.fecha.$gte = new Date(fecha_inicio);

      if (fecha_fin) {
        const fin = new Date(fecha_fin);
        fin.setHours(23, 59, 59, 999);
        query.fecha.$lte = fin;
      }
    }

    const producciones = await ProduccionNegocio.find(query).sort({
      fecha: -1,
    });

    res.status(200).json(producciones);
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo producciones sin liquidar",
      error: error.message,
    });
  }
};

module.exports = {
  addProduction,
  getProductions,
  updateProduction,
  deleteProduction,
  addProductionPayment,
  getUnsettledProductions,
};
