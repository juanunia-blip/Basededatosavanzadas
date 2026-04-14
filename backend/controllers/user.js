const Usuario = require('../models/UserModel');

const addUser = async (req, res) => {
  try {
    const { usuario_id, nombre, email, ciudad, fecha_registro } = req.body;

    if (!usuario_id || !nombre || !email || !ciudad || !fecha_registro) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const existsUserId = await Usuario.findOne({ usuario_id });
    if (existsUserId) {
      return res.status(400).json({ message: 'El usuario_id ya existe' });
    }

    const existsEmail = await Usuario.findOne({ email });
    if (existsEmail) {
      return res.status(400).json({ message: 'El email ya existe' });
    }

    const usuario = new Usuario({
      usuario_id,
      nombre,
      email,
      ciudad,
      fecha_registro
    });

    await usuario.save();

    res.status(201).json({ message: 'Usuario creado correctamente', data: usuario });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const usuarios = await Usuario.find().sort({ createdAt: -1 });
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

const getUserByUsuarioId = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const usuario = await Usuario.findOne({ usuario_id });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByIdAndUpdate(id, req.body, { new: true });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario actualizado correctamente', data: usuario });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByIdAndDelete(id);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};

module.exports = {
  addUser,
  getUsers,
  getUserByUsuarioId,
  updateUser,
  deleteUser
};