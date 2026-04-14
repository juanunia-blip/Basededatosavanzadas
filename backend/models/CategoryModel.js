const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    categoria_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true
    }
  },
  { timestamps: true, collection: 'categorias' }
);

module.exports = mongoose.model('Categoria', CategorySchema);