const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    usuario_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    ciudad: {
      type: String,
      required: true,
      trim: true
    },
    fecha_registro: {
      type: Date,
      required: true
    }
  },
  { timestamps: true, collection: 'usuarios' }
);

module.exports = mongoose.model('Usuario', UserSchema);