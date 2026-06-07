const TrabajadorNegocio = require("../../models/BusinessWorkerModel");
const ProduccionNegocio = require("../../models/BusinessProductionModel");

const { getUsuarioId, validarNegocio } = require("./helpers");

const toNumber = (value) => {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const calcularValoresProduccion = ({ kilos, precio_kilo, abonado = 0 }) => {
  const kilosNumber = toNumber(kilos);
  const precioKiloNumber = toNumber(precio_kilo);
  const abonadoNumber = Math.max(toNumber(abonado), 0);

  const total_pago = kilosNumber * precioKiloNumber;
  const abonadoFinal = Math.min(abonadoNumber, total_pago);
  const pendiente = Math.max(total_pago - abonadoFinal, 0);

  let estado = "pendiente";

  if (abonadoFinal > 0 && abonadoFinal < total_pago) {
    estado = "abonado";
  }

  if (total_pago > 0 && abonadoFinal >= total_pago) {
    estado = "pagado";
  }

  return {
    kilos: kilosNumber,
    precio_kilo: precioKiloNumber,
    total_pago,
    abonado: abonadoFinal,
    pendiente,
    estado,
  };
};

const validarValoresProduccion = ({ kilos, precio_kilo }) => {
  const kilosNumber = toNumber(kilos);
  const precioKiloNumber = toNumber(precio_kilo);

  if (kilosNumber <= 0 || precioKiloNumber <= 0) {
    return "Los kilos y el precio por kilo deben ser mayores que cero";
  }

  return null;
};

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

    const validationError = validarValoresProduccion({
      kilos,
      precio_kilo,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
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

    const valoresProduccion = calcularValoresProduccion({
      kilos,
      precio_kilo,
      abonado,
    });

    const produccion = await ProduccionNegocio.create({
      usuario_id,
      negocio_id: negocio._id,
      trabajador_id: trabajador._id,
      trabajador_nombre: trabajador.nombre,
      fecha,
      ...valoresProduccion,
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
    delete req.body.total_pago;
    delete req.body.pendiente;
    delete req.body.estado;

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
          "No puedes editar una producción que ya pertenece a una liquidación. Elimina o anula la liquidación primero.",
      });
    }

    const kilosFinal =
      req.body.kilos !== undefined
        ? toNumber(req.body.kilos)
        : toNumber(produccionExistente.kilos);

    const precioKiloFinal =
      req.body.precio_kilo !== undefined
        ? toNumber(req.body.precio_kilo)
        : toNumber(produccionExistente.precio_kilo);

    const abonadoFinal =
      req.body.abonado !== undefined
        ? toNumber(req.body.abonado)
        : toNumber(produccionExistente.abonado);

    const validationError = validarValoresProduccion({
      kilos: kilosFinal,
      precio_kilo: precioKiloFinal,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const valoresProduccion = calcularValoresProduccion({
      kilos: kilosFinal,
      precio_kilo: precioKiloFinal,
      abonado: abonadoFinal,
    });

    const payload = {
      ...req.body,
      ...valoresProduccion,
    };

    if (req.body.trabajador_id) {
      const trabajador = await TrabajadorNegocio.findOne({
        _id: req.body.trabajador_id,
        usuario_id,
        negocio_id: businessId,
      });

      if (!trabajador) {
        return res.status(404).json({
          message: "Trabajador no encontrado",
        });
      }

      payload.trabajador_id = trabajador._id;
      payload.trabajador_nombre = trabajador.nombre;
    }

    const produccion = await ProduccionNegocio.findOneAndUpdate(
      {
        _id: productionId,
        negocio_id: businessId,
        usuario_id,
      },
      payload,
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
          "No puedes eliminar una producción que ya pertenece a una liquidación. Elimina o anula la liquidación primero.",
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
    const aporte = toNumber(req.body.monto);

    if (aporte <= 0) {
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

    const nuevoAbonado = toNumber(produccion.abonado) + aporte;

    const valoresProduccion = calcularValoresProduccion({
      kilos: produccion.kilos,
      precio_kilo: produccion.precio_kilo,
      abonado: nuevoAbonado,
    });

    produccion.kilos = valoresProduccion.kilos;
    produccion.precio_kilo = valoresProduccion.precio_kilo;
    produccion.total_pago = valoresProduccion.total_pago;
    produccion.abonado = valoresProduccion.abonado;
    produccion.pendiente = valoresProduccion.pendiente;
    produccion.estado = valoresProduccion.estado;

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

      if (fecha_inicio) {
        query.fecha.$gte = new Date(fecha_inicio);
      }

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