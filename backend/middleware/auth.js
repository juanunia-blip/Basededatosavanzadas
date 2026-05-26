const jwt = require("jsonwebtoken");
const Usuario = require("../models/UserModel");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "No autorizado",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const usuario = await Usuario.findById(
      decoded.id
    );

    if (!usuario) {
      return res.status(401).json({
        message: "Usuario no encontrado",
      });
    }

    req.usuario = {
      id: usuario._id,
      usuario_id: usuario.usuario_id,
      nombre: usuario.nombre,
      email: usuario.email,
      ciudad: usuario.ciudad || "",
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido",
    });
  }
};

module.exports = {
  protect,
};