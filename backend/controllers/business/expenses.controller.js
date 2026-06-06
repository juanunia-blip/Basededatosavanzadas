const GastoNegocio = require("../../models/BusinessExpenseModel");

const { getUsuarioId, validarNegocio } = require("./helpers");

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

module.exports = {
  addBusinessExpense,
  getBusinessExpenses,
  updateBusinessExpense,
  deleteBusinessExpense,
};
