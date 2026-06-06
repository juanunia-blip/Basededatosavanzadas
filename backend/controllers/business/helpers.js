const Negocio = require("../../models/BusinessModel");

const getUsuarioId = (req) => req.usuario.usuario_id;

const validarNegocio = async (businessId, usuario_id) => {
  return await Negocio.findOne({
    _id: businessId,
    usuario_id,
  });
};

const getMonthKey = (date) => {
  if (!date) return "sin_fecha";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "sin_fecha";
  }

  return value.toISOString().slice(0, 7);
};

const addToPeriod = (target, period, values = {}) => {
  if (!target[period]) {
    target[period] = {
      periodo: period,
      ventas: 0,
      gastosOperativos: 0,
      gastosTrabajadores: 0,
      gastosTotales: 0,
      utilidadNeta: 0,
      kilosVendidos: 0,
      kilosProducidos: 0,
      producciones: 0,
      liquidaciones: 0,
    };
  }

  Object.keys(values).forEach((key) => {
    target[period][key] += Number(values[key] || 0);
  });

  target[period].gastosTotales =
    Number(target[period].gastosOperativos || 0) +
    Number(target[period].gastosTrabajadores || 0);

  target[period].utilidadNeta =
    Number(target[period].ventas || 0) -
    Number(target[period].gastosTotales || 0);
};

module.exports = {
  getUsuarioId,
  validarNegocio,
  getMonthKey,
  addToPeriod,
};
