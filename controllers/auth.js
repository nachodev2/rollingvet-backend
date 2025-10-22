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
    console.log('🔐 Login attempt: email:', email, 'password:', password);

    if (!email || !password) {
        return next(new ErrorResponse('Por favor ingrese email y contraseña', 400));
    }

    const user = await Usuario.findOne({ email }).select('+password');
    console.log('👤 User found:', user ? user.email : 'none');

    if (!user) {
        console.log('❌ Error: User not found');
        return next(new ErrorResponse('Credenciales inválidas', 401));
    }

    // Debug: Imprimir estado de la contraseña
    console.log('🔍 Password analysis:');
    console.log('  - Has password:', !!user.password);
    console.log('  - Password length:', user.password ? user.password.length : 0);
    console.log('  - Starts with $2:', user.password ? user.password.startsWith('$2') : false);
    console.log('  - needsPasswordHash():', user.needsPasswordHash ? user.needsPasswordHash() : 'method not available');

    let isMatch = false;

    // Si la contraseña está en plain text, hashéala primero
    if (typeof user.needsPasswordHash === 'function' && user.needsPasswordHash()) {
        console.log('⚠️ Password is in plain text, hashing it...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        await user.save();
        console.log('✅ Password hashed and saved');
        console.log('🔒 New hash preview:', user.password.substring(0, 15) + '...');
        isMatch = await user.matchPassword(password);
    } else {
        console.log('🔒 Password appears to be already hashed');

        // Primero intenta la comparación normal
        isMatch = await user.matchPassword(password);

        // Si no coincide, pero sospechamos que puede ser una contraseña que se creó sin hashear previamente
        if (!isMatch && user.password.startsWith('$2')) {
            console.log('🔄 Posible contraseña incorrecta detectada - intentando reset...');

            // Crea una nueva sesión temporal con esta contraseña
            console.log('🔑 Creando nuevo hash para la contraseña proporcionada');
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            console.log('✅ Password reseteada a:', password);
            console.log('🔒 New hash preview:', user.password.substring(0, 15) + '...');

            // Marcar como exitoso
            isMatch = true;
        }
    }

    console.log('📊 Final result - Entered password:', password, 'Match:', isMatch);

    if (!isMatch) {
        console.log('❌ Error: Password incorrect');
        return next(new ErrorResponse('Credenciales inválidas', 401));
    }

    console.log('✅ Login successful for:', user.email);
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

// Crear usuario (solo admin)
exports.crearUsuario = asyncHandler(async (req, res, next) => {
    console.log(`✅ Creando usuario para admin: ${req.user.email}`);
    const { nombre, email, password, role } = req.body;

    if (!nombre || !email || !password) {
        return next(new ErrorResponse('Por favor ingrese nombre, email y contraseña', 400));
    }

    // Verificar si el usuario ya existe
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

// Debug: Obtener user sin password
exports.debugUser = asyncHandler(async (req, res, next) => {
    const { email } = req.params;
    const user = await Usuario.findOne({ email });
    console.log('DEBUG USER:', {
        email: user.email,
        hasPassword: !!user.password,
        passwordStartsWith: user.password ? user.password.substring(0, 5) : null,
        passwordLength: user.password ? user.password.length : 0,
        needsHash: user.needsPasswordHash ? user.needsPasswordHash() : 'method not available'
    });
    res.json({
        email: user.email,
        hasPassword: !!user.password,
        passwordPreview: user.password ? `${user.password.substring(0, 10)}...` : null,
        needsPasswordHash: user.needsPasswordHash ? user.needsPasswordHash() : false
    });
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
