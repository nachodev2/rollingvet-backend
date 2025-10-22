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
    console.log('req.body:', req.body);
    const { nombreDueno, nombre, name, emailDueno, email, password, pass, role, telefonoDueno, telefono, telefonoProveedor } = req.body;
    const finalNombre = nombreDueno || nombre || name;
    const finalEmail = emailDueno || email;
    const finalPassword = password || pass;
    const finalTelefono = telefonoDueno || telefono || telefonoProveedor;
    console.log('final nombre:', finalNombre, 'email:', finalEmail, 'final password:', finalPassword, 'final telefono:', finalTelefono);

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
    console.log('Login attempt: email:', email, 'password:', password);

    if (!email || !password) {
        return next(new ErrorResponse('Por favor ingrese email y contraseña', 400));
    }

    const user = await Usuario.findOne({ email }).select('+password');
    console.log('User found:', user ? user.email : 'none');

    if (!user) {
        console.log('Error: User not found');
        return next(new ErrorResponse('Credenciales inválidas', 401));
    }

    const isMatch = await user.matchPassword(password);
    console.log('Entered password:', password);
    console.log('Stored hash:', user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
        console.log('Error: Password incorrect');
        return next(new ErrorResponse('Credenciales inválidas', 401));
    }

    sendTokenResponse(user, 200, res);
});

// Cambiar contraseña
// Cambiar contraseña
exports.changePassword = asyncHandler(async (req, res, next) => {
    console.log('Change password requested by:', req.user.email);
    const user = await Usuario.findById(req.user._id).select('+password');
    console.log('User reloaded with password:', user ? 'yes' : 'no', 'password field:', user.password ? 'present' : 'null');
    const { oldPassword, newPassword, confirmPassword } = req.body;
    console.log('changePassword req.body:', { oldPassword, newPasswordConfirm: confirmPassword });

    if (!oldPassword || !newPassword || !confirmPassword) {
        return next(new ErrorResponse('Por favor ingrese todas las contraseñas', 400));
    }

    // Verificar contraseña antigua
    if (!(await user.matchPassword(oldPassword))) {
        return next(new ErrorResponse('Contraseña antigua incorrecta', 400));
    }

    // Validaciones nueva contraseña
    if (newPassword.length < 6) {
        return next(new ErrorResponse('La nueva contraseña debe tener al menos 6 caracteres', 400));
    }

    if (newPassword === oldPassword) {
        return next(new ErrorResponse('La nueva contraseña debe ser diferente a la anterior', 400));
    }

    if (newPassword !== confirmPassword) {
        return next(new ErrorResponse('Las contraseñas nuevas no coinciden', 400));
    }

    // Generar hash nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    sendTokenResponse(user, 200, res);

    // Responde con token incluido para auto-login
    // El frontend puede usar el token para continuar sesión
});

// Obtener todos los usuarios (solo admin)
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

// Middleware de autenticación
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    console.log('🔐 Headers authorization:', req.headers.authorization);
    console.log('🍪 Cookies:', req.cookies.token ? 'Cookie presente' : 'Sin cookie');

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
        console.log('✅ Token extraído del header');
    } else if (req.cookies.token) {
        token = req.cookies.token;
        console.log('✅ Token extraído de cookie');
    }

    if (!token) {
        console.log('❌ No hay token');
        return next(new ErrorResponse('No estás autorizado para acceder a esta ruta', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token decodificado:', decoded);
        
        req.user = await Usuario.findById(decoded.id);
        
        if (!req.user) {
            console.log('❌ Usuario no encontrado en BD');
            return next(new ErrorResponse('Usuario no encontrado', 401));
        }
        
        console.log('✅ Usuario autenticado:', req.user.email, 'Role:', req.user.role);
        next();
    } catch (error) {
        console.log('❌ Error verificando token:', error.message);
        return next(new ErrorResponse('No estás autorizado para acceder a esta ruta', 401));
    }
});

// Middleware de autorización por rol
exports.authorize = (...roles) => {
    return (req, res, next) => {
        console.log(`🔒 Autorizando: user role "${req.user.role}", required roles: [${roles.join(', ')}]`);
        if (!roles.includes(req.user.role)) {
            console.log('❌ Acceso denegado - rol insuficiente');
            return next(new ErrorResponse('No tienes permisos para acceder a esta acción', 403));
        }
        console.log('✅ Acceso permitido');
        next();
    };
};
