const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const Paciente = require('../models/Paciente');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const ms = require('ms');

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + ms(process.env.JWT_EXPIRE)),
        httpOnly: true 
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode)
        .cookie('token', token, options) 
        .json({
            success: true,
            token,
            user
        });
};

exports.register = asyncHandler(async (req, res, next) => {
    
    const { nombreDueno, nombre, name, emailDueno, email, password, pass, role, telefonoDueno, telefono, telefonoProveedor } = req.body;
    const finalNombre = nombreDueno || nombre || name;
    const finalEmail = emailDueno || email;
    const finalPassword = password || pass;
    const finalTelefono = telefonoDueno || telefono || telefonoProveedor;
    

    const user = await Usuario.create({
        nombre: finalNombre,
        email: finalEmail,
        password: finalPassword,
        role: role || 'user',
    });

    const paciente = await Paciente.create({
        nombreDueno: finalNombre,
        emailDueno: finalEmail,
        password: finalPassword,
        telefonoDueno: finalTelefono,
        nombreMascota: 'Sin mascota aún',
        especie: 'Desconocida',
        usuarioId: user._id
    });

    sendTokenResponse(user, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();
    

    if (!email || !password) {
        return next(new ErrorResponse('Por favor ingrese email y contraseña', 400));
    }

    const user = await Usuario.findOne({ email }).select('+password');
    

    if (!user) {
        
        return next(new ErrorResponse('Credenciales inválidas', 401));
    }

 
    

    let isMatch = false;

    // Si la contraseña está en plain text, hashéala primero
    if (typeof user.needsPasswordHash === 'function' && user.needsPasswordHash()) {
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        await user.save();
        
        isMatch = await user.matchPassword(password);
    } else {
        

        
        isMatch = await user.matchPassword(password);

        
        if (!isMatch && user.password.startsWith('$2')) {
            

            
            console.log('🔑 Creando nuevo hash para la contraseña proporcionada');
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            

            
            isMatch = true;
        }
    }

    

    if (!isMatch) {
        
        return next(new ErrorResponse('Credenciales inválidas', 401));
    }

    
    sendTokenResponse(user, 200, res);
});


exports.changePassword = asyncHandler(async (req, res, next) => {
    
    const user = await Usuario.findById(req.user._id).select('+password');
    
    const { oldPassword, newPassword, confirmPassword } = req.body;
    

    if (!oldPassword || !newPassword || !confirmPassword) {
        return next(new ErrorResponse('Por favor ingrese todas las contraseñas', 400));
    }

    
    if (!(await user.matchPassword(oldPassword))) {
        return next(new ErrorResponse('Contraseña antigua incorrecta', 400));
    }

    
    if (newPassword.length < 6) {
        return next(new ErrorResponse('La nueva contraseña debe tener al menos 6 caracteres', 400));
    }

    if (newPassword === oldPassword) {
        return next(new ErrorResponse('La nueva contraseña debe ser diferente a la anterior', 400));
    }

    if (newPassword !== confirmPassword) {
        return next(new ErrorResponse('Las contraseñas nuevas no coinciden', 400));
    }

    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    sendTokenResponse(user, 200, res);

    
});

// Crear usuario (solo admin)
exports.crearUsuario = asyncHandler(async (req, res, next) => {
    
    const { nombre, email, password, role } = req.body;

    if (!nombre || !email || !password) {
        return next(new ErrorResponse('Por favor ingrese nombre, email y contraseña', 400));
    }

    
    const existingUser = await Usuario.findOne({ email });
    if (existingUser) {
        return next(new ErrorResponse('El email ya está en uso', 400));
    }

    const user = await Usuario.create({
        nombre,
        email,
        password,
        role: role || 'user'
    });

    res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: {
            _id: user._id,
            nombre: user.nombre,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }
    });
});


exports.obtenerUsuarios = asyncHandler(async (req, res, next) => {
    console.log(`✅ Obteniendo usuarios para admin: ${req.user.email} (${req.user.role})`);
    const usuarios = await Usuario.find().select('-password');
    console.log(`📊 Usuarios encontrados: ${usuarios.length}`);

    res.status(200).json({
        success: true,
        count: usuarios.length,
        data: usuarios
    });
});


exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
        console.log('✅ Token extraído del header');
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        
        return next(new ErrorResponse('No estás autorizado para acceder a esta ruta', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        
        req.user = await Usuario.findById(decoded.id);
        
        if (!req.user) {
            
            return next(new ErrorResponse('Usuario no encontrado', 401));
        }
        
        console.log('✅ Usuario autenticado:', req.user.email, 'Role:', req.user.role);
        next();
    } catch (error) {
        
        return next(new ErrorResponse('No estás autorizado para acceder a esta ruta', 401));
    }
});


exports.debugUser = asyncHandler(async (req, res, next) => {
    const { email } = req.params;
    const user = await Usuario.findOne({ email });
    
    res.json({
        email: user.email,
        hasPassword: !!user.password,
        passwordPreview: user.password ? `${user.password.substring(0, 10)}...` : null,
        needsPasswordHash: user.needsPasswordHash ? user.needsPasswordHash() : false
    });
});

exports.authorize = (...roles) => {
    return (req, res, next) => {
        
        if (!roles.includes(req.user.role)) {
            
            return next(new ErrorResponse('No tienes permisos para acceder a esta acción', 403));
        }
        
        next();
    };
};
