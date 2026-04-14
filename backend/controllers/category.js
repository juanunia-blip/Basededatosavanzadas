const Categoria = require('../models/CategoryModel');

const addCategory = async (req, res) => {
  try {
    const { categoria_id, nombre } = req.body;

    if (!categoria_id || !nombre) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const existsId = await Categoria.findOne({ categoria_id });
    if (existsId) {
      return res.status(400).json({ message: 'La categoria_id ya existe' });
    }

    const existsName = await Categoria.findOne({ nombre });
    if (existsName) {
      return res.status(400).json({ message: 'La categoría ya existe' });
    }

    const categoria = new Categoria({ categoria_id, nombre });
    await categoria.save();

    res.status(201).json({ message: 'Categoría creada correctamente', data: categoria });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear categoría', error: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categorias = await Categoria.find().sort({ createdAt: -1 });
    res.status(200).json(categorias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByIdAndUpdate(id, req.body, { new: true });

    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.status(200).json({ message: 'Categoría actualizada correctamente', data: categoria });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar categoría', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByIdAndDelete(id);

    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.status(200).json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar categoría', error: error.message });
  }
};

module.exports = {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory
};