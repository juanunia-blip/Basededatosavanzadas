const Categoria = require("../models/CategoryModel");

const addCategory = async (req, res) => {
  try {
    let { categoria_id, nombre } = req.body;

    const usuario_id = req.usuario.usuario_id;

    if (!nombre) {
      return res.status(400).json({
        message: "El nombre de la categoría es obligatorio",
      });
    }

    nombre = nombre.trim();

    if (!categoria_id) {
      categoria_id = `C${Date.now()}`;
    }

    const existsId = await Categoria.findOne({
      categoria_id,
      usuario_id,
    });

    if (existsId) {
      return res.status(400).json({
        message: "La categoria_id ya existe para este usuario",
      });
    }

    const existsName = await Categoria.findOne({
      nombre,
      usuario_id,
    });

    if (existsName) {
      return res.status(400).json({
        message: "La categoría ya existe para este usuario",
      });
    }

    const categoria = new Categoria({
      categoria_id,
      nombre,
      usuario_id,
    });

    await categoria.save();

    res.status(201).json({
      message: "Categoría creada correctamente",
      data: categoria,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear categoría",
      error: error.message,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categorias = await Categoria.find({
      usuario_id: req.usuario.usuario_id,
    }).sort({ createdAt: -1 });

    res.status(200).json(categorias);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener categorías",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario_id = req.usuario.usuario_id;

    delete req.body.usuario_id;

    const categoria = await Categoria.findOneAndUpdate(
      {
        _id: id,
        usuario_id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!categoria) {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    res.status(200).json({
      message: "Categoría actualizada correctamente",
      data: categoria,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar categoría",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario_id = req.usuario.usuario_id;

    const categoria = await Categoria.findOneAndDelete({
      _id: id,
      usuario_id,
    });

    if (!categoria) {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    res.status(200).json({
      message: "Categoría eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar categoría",
      error: error.message,
    });
  }
};

module.exports = {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};