const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    categoria_id: {
      type: String,
      required: true,
      trim: true,
    },

    usuario_id: {
      type: String,
      required: true,
      trim: true,
    },

    nombre: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "categorias",
  }
);

/*
  Evita duplicados SOLO por usuario.
  Ejemplo:
  Juan puede tener "Comida"
  Carlos también puede tener "Comida"
*/

CategorySchema.index(
  {
    usuario_id: 1,
    categoria_id: 1,
  },
  {
    unique: true,
  }
);

CategorySchema.index(
  {
    usuario_id: 1,
    nombre: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Categoria",
  CategorySchema
);