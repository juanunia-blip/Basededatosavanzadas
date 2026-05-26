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
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    ciudad: {
      type: String,
      required: true,
      default: "",
      trim: true
    },
    fecha_registro: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true, collection: 'usuarios' }
);

module.exports = mongoose.model('Usuario', UserSchema);