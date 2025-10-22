const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UsuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Por favor, agrega un email válido'
        ]
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false 
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'  // ⚠️ CAMBIÉ DE 'admin' A 'user' - Por seguridad
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UsuarioSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    // Si ya es un hash bcrypt, no volver a hashear
    if (this.password && this.password.startsWith('$2b$')) {
        console.log('Password ya hasheada, saltando pre-save');
        next();
    } else {
        console.log('Hasheando password nuevo');
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

// ✅ ARREGLADO: Ahora incluye id Y role en el token
UsuarioSchema.methods.getSignedJwtToken = function() {
    return jwt.sign(
        { 
            id: this._id,
            role: this.role 
        }, 
        process.env.JWT_SECRET, 
        {
            expiresIn: process.env.JWT_EXPIRE
        }
    );
};

UsuarioSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
