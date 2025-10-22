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

    servicio: {
      type: mongoose.Schema.ObjectId,
      ref: 'Servicio',
      required: [true, "El servicio es obligatorio."]
    },

    servicioInfo: {
      nombre: String,
      precio: Number,
      descripcion: String,
      categoria: String
    },

    pagado: {
      type: Boolean,
      default: false,
    },

    pagoId: String,
    precioTotal: {
      type: Number,
      required: [true, "El precio total es obligatorio."]
    },

    estado: {
      type: String,
      enum: ['pendiente', 'confirmado', 'cancelado', 'completado'],
      default: 'pendiente'
    },

    veterinario: {
      type: Object,
      required: [true, "El veterinario asignado es obligatorio."],
    },

    mascota: {
      type: Object,
      required: [true, "La información de la mascota es obligatoria."],
    },

    observaciones: {
      type: String,
      maxlength: [300, 'Las observaciones no pueden tener más de 300 caracteres']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

TurnoSchema.virtual('precioFormateado').get(function() {
    return `$${this.precioTotal.toLocaleString('es-AR')}`;
});

TurnoSchema.virtual('duracionEstimada').get(function() {
    return this.servicioInfo?.duracionMinutos || 30;
});

TurnoSchema.index({ fecha: 1, hora: 1 });
TurnoSchema.index({ estado: 1, fecha: -1 });
TurnoSchema.index({ pagado: 1 });
TurnoSchema.index({ servicio: 1 });

TurnoSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('servicio')) {
    try {
      const Servicio = mongoose.model('Servicio');
      const servicio = await Servicio.findById(this.servicio);

      if (servicio) {
        this.servicioInfo = {
          nombre: servicio.nombre,
          precio: servicio.precio,
          descripcion: servicio.descripcion,
          categoria: servicio.categoria
        };

        this.precioTotal = servicio.precio;
      } else {
        return next(new Error('Servicio no encontrado'));
      }
    } catch (error) {
      return next(error);
    }
  }

  next();
});

TurnoSchema.methods.confirmarPago = function(pagoId) {
  this.pagado = true;
  this.pagoId = pagoId;
  this.estado = 'confirmado';
  return this.save();
};

TurnoSchema.methods.cancelar = function() {
  this.estado = 'cancelado';
  return this.save();
};

TurnoSchema.methods.completar = function() {
  this.estado = 'completado';
  return this.save();
};

TurnoSchema.statics.getTurnosPorFecha = function(fecha) {
  return this.find({ fecha }).sort({ hora: 1 }).populate('servicio');
};

module.exports = mongoose.model("Turno", TurnoSchema);
