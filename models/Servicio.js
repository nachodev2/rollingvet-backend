<<<<<<< HEAD
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
=======
const mongoose = require('mongoose');

const ServicioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del servicio es obligatorio'],
        trim: true,
        maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
    },

    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
    },

    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },

    duracionMinutos: {
        type: Number,
        required: [true, 'La duración es obligatoria'],
        min: [15, 'La duración mínima es de 15 minutos']
    },

    categoria: {
        type: String,
        enum: ['consulta', 'cirugia', 'vacunacion', 'desparasitacion', 'baño', 'peluqueria', 'otros'],
        default: 'consulta'
    },

    activo: {
        type: Boolean,
        default: true
    },

    // Información adicional opcional
    requiereAyuno: {
        type: Boolean,
        default: false
    },

    observaciones: {
        type: String,
        maxlength: [300, 'Las observaciones no pueden tener más de 300 caracteres']
    }
}, {
    timestamps: true
});

// Index para búsqueda por nombre y categoría
ServicioSchema.index({ nombre: 'text', categoria: 1 });
ServicioSchema.index({ activo: 1, categoria: 1 });

// Virtual para formatear precio
ServicioSchema.virtual('precioFormateado').get(function() {
    return `$${this.precio.toLocaleString('es-AR')}`;
});

// Método para obtener servicios activos por categoría
ServicioSchema.statics.getServiciosActivos = function(categoria = null) {
    const query = { activo: true };
    if (categoria) {
        query.categoria = categoria;
    }
    return this.find(query).sort({ nombre: 1 });
};

// Método para validar precio
ServicioSchema.methods.validarPrecio = function() {
    return this.precio >= 0;
};

module.exports = mongoose.model('Servicio', ServicioSchema);
>>>>>>> 54cd63967687a84848e01a9bd87b60e29a5664e1
