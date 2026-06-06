const VentaNegocio = require("../../models/BusinessSaleModel");

const { getUsuarioId, validarNegocio } = require("./helpers");

const addBusinessSale = async (req, res) => {
  try {
    const usuario_id = getUsuarioId(req);

    const {
      producto,
      kilos,
      cantidad,
      precio_kilo,
      precio_unitario,
      precio_carga,
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
      kilos: Number(kilos || cantidadFinal || 0),
      cantidad: Number(cantidad || cantidadFinal || 0),
      precio_kilo: Number(precio_kilo || precioFinal || 0),
      precio_unitario: Number(precio_unitario || precioFinal || 0),
      precio_carga: Number(precio_carga || 0),
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
    if (req.body.precio_carga !== undefined)
      req.body.precio_carga = Number(req.body.precio_carga);
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

module.exports = {
  addBusinessSale,
  getBusinessSales,
  updateBusinessSale,
  deleteBusinessSale,
};
