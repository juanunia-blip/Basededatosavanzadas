const Cuenta = require("../models/AccountModel");

exports.getAccounts = async (req, res) => {
  try {
    const filters = {};

    if (req.query.usuario_id) {
      filters.usuario_id = req.query.usuario_id;
    }

    if (req.query.activa !== undefined) {
      filters.activa = req.query.activa === "true";
    }

    const accounts = await Cuenta.find(filters).sort({
      fecha_corte: 1,
    });

    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las cuentas",
      error: error.message,
    });
  }
};

exports.addAccount = async (req, res) => {
  try {
    const {
      usuario_id,
      nombre,
      tipo,
      banco,
      saldo,
      fecha_corte,
      fecha_pago,
      activa,
    } = req.body;

    if (
      !usuario_id ||
      !nombre ||
      !tipo ||
      !banco ||
      fecha_corte === undefined ||
      fecha_pago === undefined
    ) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    const account = new Cuenta({
      cuenta_id: `CTA${Date.now()}`,
      usuario_id,
      nombre,
      tipo,
      banco,
      saldo: Number(saldo || 0),
      fecha_corte: Number(fecha_corte),
      fecha_pago: Number(fecha_pago),
      activa: activa ?? true,
    });

    await account.save();

    res.status(201).json({
      message: "Cuenta creada correctamente",
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear cuenta",
      error: error.message,
    });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.saldo !== undefined) {
      req.body.saldo = Number(req.body.saldo);
    }

    if (req.body.fecha_corte !== undefined) {
      req.body.fecha_corte = Number(req.body.fecha_corte);
    }

    if (req.body.fecha_pago !== undefined) {
      req.body.fecha_pago = Number(req.body.fecha_pago);
    }

    const account = await Cuenta.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!account) {
      return res.status(404).json({
        message: "Cuenta no encontrada",
      });
    }

    res.status(200).json({
      message: "Cuenta actualizada correctamente",
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar cuenta",
      error: error.message,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await Cuenta.findByIdAndDelete(id);

    if (!account) {
      return res.status(404).json({
        message: "Cuenta no encontrada",
      });
    }

    res.status(200).json({
      message: "Cuenta eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar cuenta",
      error: error.message,
    });
  }
};