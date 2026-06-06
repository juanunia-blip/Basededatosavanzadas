const Negocio = require("../models/BusinessModel");
const TrabajadorNegocio = require("../models/BusinessWorkerModel");
const ProduccionNegocio = require("../models/BusinessProductionModel");
const GastoNegocio = require("../models/BusinessExpenseModel");
const VentaNegocio = require("../models/BusinessSaleModel");
const LiquidacionNegocio = require("../models/BusinessSettlementModel");

/* =========================
   HELPERS
========================= */

const getUsuarioId = (req) => req.usuario.usuario_id;

const validarNegocio = async (businessId, usuario_id) => {
  return await Negocio.findOne({
    _id: businessId,
    usuario_id,
  });
};

/* =========================
   BUSINESSES
========================= */

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
      TrabajadorNegocio.deleteMany({
        usuario_id,
        negocio_id: req.params.id,
      }),
      ProduccionNegocio.deleteMany({
        usuario_id,
        negocio_id: req.params.id,
      }),
      GastoNegocio.deleteMany({
        usuario_id,
        negocio_id: req.params.id,
      }),
      VentaNegocio.deleteMany({
        usuario_id,
        negocio_id: req.params.id,
      }),
      LiquidacionNegocio.deleteMany({
        usuario_id,
        negocio_id: req.params.id,
      }),
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

/* =========================
   WORKERS
========================= */

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

/* =========================
   PRODUCTIONS / DAILY WORK
========================= */

const addProduction = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);

    const {
      trabajador_id,
      fecha,
      kilos,
      precio_kilo,
      abonado,
      observacion,
    } = req.body;

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

    if (req.body.kilos !== undefined) {
      req.body.kilos = Number(req.body.kilos);
    }

    if (req.body.precio_kilo !== undefined) {
      req.body.precio_kilo = Number(req.body.precio_kilo);
    }

    if (req.body.abonado !== undefined) {
      req.body.abonado = Number(req.body.abonado);
    }

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

/*
  Este endpoint se mantiene por compatibilidad con el frontend actual.
  Para el flujo nuevo, lo recomendado es abonar a la liquidación.
*/
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

/* =========================
   SETTLEMENTS / LIQUIDACIONES
========================= */

const createSettlement = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { businessId } = req.params;

    const {
      trabajador_id,
      fecha_inicio,
      fecha_fin,
      periodo = "semana",
      abonado = 0,
      observacion,
    } = req.body;

    if (!trabajador_id || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        message: "trabajador_id, fecha_inicio y fecha_fin son obligatorios",
      });
    }

    const negocio = await validarNegocio(businessId, usuario_id);

    if (!negocio) {
      return res.status(404).json({
        message: "Negocio no encontrado",
      });
    }

    const trabajador = await TrabajadorNegocio.findOne({
      _id: trabajador_id,
      usuario_id,
      negocio_id: businessId,
    });

    if (!trabajador) {
      return res.status(404).json({
        message: "Trabajador no encontrado",
      });
    }

    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    fin.setHours(23, 59, 59, 999);

    if (inicio > fin) {
      return res.status(400).json({
        message: "La fecha de inicio no puede ser mayor que la fecha fin",
      });
    }

    const producciones = await ProduccionNegocio.find({
      usuario_id,
      negocio_id: businessId,
      trabajador_id,
      liquidacion_id: null,
      fecha: {
        $gte: inicio,
        $lte: fin,
      },
    }).sort({ fecha: 1 });

    if (!producciones.length) {
      return res.status(400).json({
        message:
          "No existen producciones pendientes por liquidar para este trabajador en ese rango de fechas",
      });
    }

    const total_kilos = producciones.reduce(
      (sum, item) => sum + Number(item.kilos || 0),
      0
    );

    const total_pago = producciones.reduce(
      (sum, item) => sum + Number(item.total_pago || 0),
      0
    );

    const precio_kilo_promedio =
      total_kilos > 0 ? Math.round(total_pago / total_kilos) : 0;

    const abonoInicial = Math.min(Number(abonado || 0), total_pago);

    const liquidacion = await LiquidacionNegocio.create({
      usuario_id,
      negocio_id: businessId,
      trabajador_id,
      trabajador_nombre: trabajador.nombre,
      fecha_inicio: inicio,
      fecha_fin: fin,
      periodo,
      total_kilos,
      precio_kilo_promedio,
      total_pago,
      abonado: abonoInicial,
      pendiente: Math.max(total_pago - abonoInicial, 0),
      producciones: producciones.map((item) => item._id),
      observacion: observacion || "",
    });

    await ProduccionNegocio.updateMany(
      {
        _id: {
          $in: producciones.map((item) => item._id),
        },
      },
      {
        $set: {
          liquidacion_id: liquidacion._id,
        },
      }
    );

    res.status(201).json({
      message: "Liquidación creada correctamente",
      data: liquidacion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creando liquidación",
      error: error.message,
    });
  }
};

const getSettlements = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { businessId } = req.params;

    const liquidaciones = await LiquidacionNegocio.find({
      usuario_id,
      negocio_id: businessId,
    }).sort({ fecha_inicio: -1 });

    res.status(200).json(liquidaciones);
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo liquidaciones",
      error: error.message,
    });
  }
};

const getSettlementById = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { businessId, settlementId } = req.params;

    const liquidacion = await LiquidacionNegocio.findOne({
      _id: settlementId,
      usuario_id,
      negocio_id: businessId,
    }).populate("producciones");

    if (!liquidacion) {
      return res.status(404).json({
        message: "Liquidación no encontrada",
      });
    }

    res.status(200).json(liquidacion);
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo liquidación",
      error: error.message,
    });
  }
};

const addSettlementPayment = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { businessId, settlementId } = req.params;
    const monto = Number(req.body.monto);

    if (isNaN(monto) || monto <= 0) {
      return res.status(400).json({
        message: "El abono debe ser mayor que cero",
      });
    }

    const liquidacion = await LiquidacionNegocio.findOne({
      _id: settlementId,
      usuario_id,
      negocio_id: businessId,
    });

    if (!liquidacion) {
      return res.status(404).json({
        message: "Liquidación no encontrada",
      });
    }

    liquidacion.abonado = Number(liquidacion.abonado || 0) + monto;

    if (liquidacion.abonado > liquidacion.total_pago) {
      liquidacion.abonado = liquidacion.total_pago;
    }

    await liquidacion.save();

    res.status(200).json({
      message: "Abono registrado correctamente",
      data: liquidacion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registrando abono",
      error: error.message,
    });
  }
};

const markSettlementAsPaid = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { businessId, settlementId } = req.params;

    const liquidacion = await LiquidacionNegocio.findOne({
      _id: settlementId,
      usuario_id,
      negocio_id: businessId,
    });

    if (!liquidacion) {
      return res.status(404).json({
        message: "Liquidación no encontrada",
      });
    }

    liquidacion.abonado = Number(liquidacion.total_pago || 0);
    await liquidacion.save();

    res.status(200).json({
      message: "Liquidación marcada como pagada",
      data: liquidacion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error marcando liquidación como pagada",
      error: error.message,
    });
  }
};

const deleteSettlement = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { businessId, settlementId } = req.params;

    const liquidacion = await LiquidacionNegocio.findOne({
      _id: settlementId,
      usuario_id,
      negocio_id: businessId,
    });

    if (!liquidacion) {
      return res.status(404).json({
        message: "Liquidación no encontrada",
      });
    }

    await ProduccionNegocio.updateMany(
      {
        usuario_id,
        negocio_id: businessId,
        liquidacion_id: liquidacion._id,
      },
      {
        $set: {
          liquidacion_id: null,
        },
      }
    );

    await liquidacion.deleteOne();

    res.status(200).json({
      message: "Liquidación eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error eliminando liquidación",
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

/* =========================
   EXPENSES
========================= */

const addBusinessExpense = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const { tipo, descripcion, monto, fecha } = req.body;

    if (!tipo || !descripcion || monto === undefined || !fecha) {
      return res.status(400).json({
        message: "tipo, descripcion, monto y fecha son obligatorios",
      });
    }

    const negocio = await validarNegocio(req.params.businessId, usuario_id);

    if (!negocio) {
      return res.status(404).json({
        message: "Negocio no encontrado",
      });
    }

    const gasto = await GastoNegocio.create({
      usuario_id,
      negocio_id: negocio._id,
      tipo,
      descripcion,
      monto: Number(monto),
      fecha,
    });

    res.status(201).json({
      message: "Gasto de negocio creado correctamente",
      data: gasto,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear gasto de negocio",
      error: error.message,
    });
  }
};

const getBusinessExpenses = async (req, res) => {
  try {
    const gastos = await GastoNegocio.find({
      usuario_id: getUsuarioId(req),
      negocio_id: req.params.businessId,
    }).sort({ fecha: -1 });

    res.status(200).json(gastos);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener gastos de negocio",
      error: error.message,
    });
  }
};

const updateBusinessExpense = async (req, res) => {
  try {
    const { businessId, expenseId } = req.params;
    const usuario_id = getUsuarioId(req);

    delete req.body.usuario_id;
    delete req.body.negocio_id;

    if (req.body.monto !== undefined) {
      req.body.monto = Number(req.body.monto);
    }

    const gasto = await GastoNegocio.findOneAndUpdate(
      {
        _id: expenseId,
        negocio_id: businessId,
        usuario_id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!gasto) {
      return res.status(404).json({
        message: "Gasto no encontrado",
      });
    }

    res.status(200).json({
      message: "Gasto actualizado correctamente",
      data: gasto,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar gasto",
      error: error.message,
    });
  }
};

const deleteBusinessExpense = async (req, res) => {
  try {
    const { businessId, expenseId } = req.params;
    const usuario_id = getUsuarioId(req);

    const gasto = await GastoNegocio.findOneAndDelete({
      _id: expenseId,
      negocio_id: businessId,
      usuario_id,
    });

    if (!gasto) {
      return res.status(404).json({
        message: "Gasto no encontrado",
      });
    }

    res.status(200).json({
      message: "Gasto eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar gasto",
      error: error.message,
    });
  }
};

/* =========================
   SALES
========================= */

const addBusinessSale = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);

    const {
      producto,
      kilos,
      cantidad,
      precio_kilo,
      precio_unitario,
      total_venta,
      fecha,
      comprador,
    } = req.body;

    if (!producto || !fecha) {
      return res.status(400).json({
        message: "producto y fecha son obligatorios",
      });
    }

    const negocio = await validarNegocio(req.params.businessId, usuario_id);

    if (!negocio) {
      return res.status(404).json({
        message: "Negocio no encontrado",
      });
    }

    const cantidadFinal = Number(cantidad || kilos || 0);
    const precioFinal = Number(precio_unitario || precio_kilo || 0);
    const totalFinal =
      total_venta !== undefined
        ? Number(total_venta || 0)
        : cantidadFinal * precioFinal;

    const venta = await VentaNegocio.create({
      usuario_id,
      negocio_id: negocio._id,
      producto,
      kilos: Number(kilos || 0),
      cantidad: Number(cantidad || 0),
      precio_kilo: Number(precio_kilo || 0),
      precio_unitario: Number(precio_unitario || 0),
      total_venta: totalFinal,
      fecha,
      comprador: comprador || "",
    });

    res.status(201).json({
      message: "Venta registrada correctamente",
      data: venta,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al registrar venta",
      error: error.message,
    });
  }
};

const getBusinessSales = async (req, res) => {
  try {
    const ventas = await VentaNegocio.find({
      usuario_id: getUsuarioId(req),
      negocio_id: req.params.businessId,
    }).sort({ fecha: -1 });

    res.status(200).json(ventas);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener ventas de negocio",
      error: error.message,
    });
  }
};

const updateBusinessSale = async (req, res) => {
  try {
    const { businessId, saleId } = req.params;
    const usuario_id = getUsuarioId(req);

    delete req.body.usuario_id;
    delete req.body.negocio_id;

    if (req.body.kilos !== undefined) req.body.kilos = Number(req.body.kilos);
    if (req.body.cantidad !== undefined)
      req.body.cantidad = Number(req.body.cantidad);
    if (req.body.precio_kilo !== undefined)
      req.body.precio_kilo = Number(req.body.precio_kilo);
    if (req.body.precio_unitario !== undefined)
      req.body.precio_unitario = Number(req.body.precio_unitario);
    if (req.body.total_venta !== undefined)
      req.body.total_venta = Number(req.body.total_venta);

    const venta = await VentaNegocio.findOneAndUpdate(
      {
        _id: saleId,
        negocio_id: businessId,
        usuario_id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!venta) {
      return res.status(404).json({
        message: "Venta no encontrada",
      });
    }

    res.status(200).json({
      message: "Venta actualizada correctamente",
      data: venta,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar venta",
      error: error.message,
    });
  }
};

const deleteBusinessSale = async (req, res) => {
  try {
    const { businessId, saleId } = req.params;
    const usuario_id = getUsuarioId(req);

    const venta = await VentaNegocio.findOneAndDelete({
      _id: saleId,
      negocio_id: businessId,
      usuario_id,
    });

    if (!venta) {
      return res.status(404).json({
        message: "Venta no encontrada",
      });
    }

    res.status(200).json({
      message: "Venta eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar venta",
      error: error.message,
    });
  }
};

/* =========================
   SUMMARY
========================= */

const getBusinessSummary = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);
    const negocio_id = req.params.businessId;

    const negocio = await validarNegocio(negocio_id, usuario_id);

    if (!negocio) {
      return res.status(404).json({
        message: "Negocio no encontrado",
      });
    }

    const [ventas, gastos, liquidaciones, produccionesSinLiquidar] =
      await Promise.all([
        VentaNegocio.find({ usuario_id, negocio_id }),
        GastoNegocio.find({ usuario_id, negocio_id }),
        LiquidacionNegocio.find({ usuario_id, negocio_id }),
        ProduccionNegocio.find({
          usuario_id,
          negocio_id,
          liquidacion_id: null,
        }),
      ]);

    const totalVentas = ventas.reduce(
      (sum, item) => sum + Number(item.total_venta || 0),
      0
    );

    const totalGastos = gastos.reduce(
      (sum, item) => sum + Number(item.monto || 0),
      0
    );

    const totalPagoTrabajadores = liquidaciones.reduce(
      (sum, item) => sum + Number(item.total_pago || 0),
      0
    );

    const totalAbonado = liquidaciones.reduce(
      (sum, item) => sum + Number(item.abonado || 0),
      0
    );

    const totalPendiente = liquidaciones.reduce(
      (sum, item) => sum + Number(item.pendiente || 0),
      0
    );

    const totalKilosSinLiquidar = produccionesSinLiquidar.reduce(
      (sum, item) => sum + Number(item.kilos || 0),
      0
    );

    const totalPagoSinLiquidar = produccionesSinLiquidar.reduce(
      (sum, item) => sum + Number(item.total_pago || 0),
      0
    );

    const utilidadNeta =
      totalVentas - totalGastos - totalPagoTrabajadores;

    res.status(200).json({
      negocio,
      resumen: {
        totalVentas,
        totalGastos,
        totalPagoTrabajadores,
        totalAbonado,
        totalPendiente,
        totalKilosSinLiquidar,
        totalPagoSinLiquidar,
        utilidadNeta,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al generar resumen del negocio",
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

  addWorker,
  getWorkers,
  updateWorker,
  deleteWorker,

  addProduction,
  getProductions,
  updateProduction,
  deleteProduction,
  addProductionPayment,

  createSettlement,
  getSettlements,
  getSettlementById,
  addSettlementPayment,
  markSettlementAsPaid,
  deleteSettlement,
  getUnsettledProductions,

  addBusinessExpense,
  getBusinessExpenses,
  updateBusinessExpense,
  deleteBusinessExpense,

  addBusinessSale,
  getBusinessSales,
  updateBusinessSale,
  deleteBusinessSale,

  getBusinessSummary,
};