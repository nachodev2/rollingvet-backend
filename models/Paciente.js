const mongoose = require("mongoose");

const PacienteSchema = new mongoose.Schema({
  nombreDueno: {
    type: String,
    required: [true, "El nombre del dueño es obligatorio"],
    trim: true,
  },
  emailDueno: {
    type: String,
    required: [true, "El email es obligatorio"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Por favor, agregue un email válido",
    ],
  },
  password: {
    type: String,
    required: [true, "Por favor ingrese una contraseña"],
    minlength: 6,
    select: false,
  },
  telefonoDueno: {
    type: String,
    required: [true, "El teléfono es obligatorio"],
  },

  nombreMascota: {
    type: String,
    trim: true,
  },
  especie: {
    type: String,
  },
  raza: {
    type: String,
    default: "Desconocida",
  },
  fechaNacimientoMascota: {
    type: Date,
  },

  historiaClinica: {
    type: String,
    default: "Sin historia clínica inicial.",
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Paciente", PacienteSchema);
