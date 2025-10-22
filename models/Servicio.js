const mongoose = require("mongoose");

const ServicioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre del servicio es obligatorio"],
    trim: true,
  },
  descripcion: {
    type: String,
    trim: true,
  },
  costo: {
    type: Number,
    required: [true, "El costo es obligatorio"],
    min: [0, "El costo debe ser positivo"],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Servicio", ServicioSchema);
