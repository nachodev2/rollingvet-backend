const mongoose = require('mongoose');

const PacienteSchema = new mongoose.Schema({
    nombreDueno: { type: String, required: true, trim: true },
    emailDueno: { type: String, required: true, match: [/* email regex */] },
    telefonoDueno: { type: String, required: true },
    nombreMascota: { type: String, default: 'Sin Asignar' }, 
    especie: { type: String, default: 'No Definida' },
    usuarioId: { // CLAVE: Referencia al Usuario que es dueño
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Paciente', PacienteSchema);