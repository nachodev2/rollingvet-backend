const mongoose = require("mongoose");

const TurnoSchema = new mongoose.Schema(
  {
    fecha: {
      type: String,
      required: [true, "La fecha del turno es obligatoria."],
    },
    hora: {
      type: String,
      required: [true, "La hora del turno es obligatoria."],
    },
    detalleCita: {
      type: String,
      required: [true, "El motivo de la consulta es obligatorio."],
      trim: true,
    },
    pagado: {
      type: Boolean,
      default: false,
    },

    veterinario: {
      type: Object,
      required: [true, "El veterinario asignado es obligatorio."],
    },

    mascota: {
      type: Object,
      required: [true, "La información de la mascota es obligatoria."],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Turno", TurnoSchema);
