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

ServicioSchema.index({ nombre: 'text', categoria: 1 });
ServicioSchema.index({ activo: 1, categoria: 1 });

ServicioSchema.virtual('precioFormateado').get(function() {
    return `$${this.precio.toLocaleString('es-AR')}`;
});

ServicioSchema.statics.getServiciosActivos = function(categoria = null) {
    const query = { activo: true };
    if (categoria) {
        query.categoria = categoria;
    }
    return this.find(query).sort({ nombre: 1 });
};

ServicioSchema.methods.validarPrecio = function() {
    return this.precio >= 0;
};

module.exports = mongoose.model('Servicio', ServicioSchema);
