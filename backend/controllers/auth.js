// backend/controllers/auth.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/UserModel");

const crearToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario._id,
      usuario_id: usuario.usuario_id,
      email: usuario.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

const generarUsuarioId = async () => {
  const ultimoUsuario = await Usuario.findOne({
    usuario_id: { $regex: /^U\d+$/ },
  })
    .sort({ usuario_id: -1 })
    .lean();

  if (!ultimoUsuario?.usuario_id) {
    return "U001";
  }

  const numeroActual = Number(ultimoUsuario.usuario_id.replace("U", ""));
  const siguienteNumero = numeroActual + 1;

  return `U${String(siguienteNumero).padStart(3, "0")}`;
};

const register = async (req, res) => {
  try {
    const { nombre, email, password, ciudad } = req.body;

    if (!nombre || !email || !password || !ciudad) {
      return res.status(400).json({
        message: "Nombre, email, contraseña y ciudad son obligatorios",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existsEmail = await Usuario.findOne({
      email: normalizedEmail,
    });

    if (existsEmail) {
      return res.status(400).json({
        message: "El email ya existe",
      });
    }

    const usuario_id = await generarUsuarioId();

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await Usuario.create({
      usuario_id,
      nombre: nombre.trim(),
      email: normalizedEmail,
      password: passwordHash,
      ciudad: ciudad.trim(),
      fecha_registro: new Date(),
    });

    const token = crearToken(usuario);

    res.status(201).json({
      message: "Usuario registrado correctamente",
      token,
      user: {
        id: usuario._id,
        usuario_id: usuario.usuario_id,
        nombre: usuario.nombre,
        email: usuario.email,
        ciudad: usuario.ciudad,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña son obligatorios",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const usuario = await Usuario.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!usuario) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    const passwordOk = await bcrypt.compare(password, usuario.password);

    if (!passwordOk) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    const token = crearToken(usuario);

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: usuario._id,
        usuario_id: usuario.usuario_id,
        nombre: usuario.nombre,
        email: usuario.email,
        ciudad: usuario.ciudad,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al iniciar sesión",
      error: error.message,
    });
  }
};

const me = async (req, res) => {
  res.status(200).json({
    user: req.usuario,
  });
};

const updateMe = async (req, res) => {
  try {
    const { nombre, ciudad, email } = req.body;

    const updateData = {};

    if (nombre) updateData.nombre = nombre.trim();
    if (ciudad) updateData.ciudad = ciudad.trim();
    if (email) updateData.email = email.trim().toLowerCase();

    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      message: "Perfil actualizado correctamente",
      user: {
        id: usuario._id,
        usuario_id: usuario.usuario_id,
        nombre: usuario.nombre,
        email: usuario.email,
        ciudad: usuario.ciudad,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar perfil",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  me,
  updateMe,
};