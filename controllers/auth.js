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
        nombreMascota: 'Sin mascota aún', // Valor por defecto
        especie: 'Desconocida', // Valor por defecto
        usuarioId: user._id
    });

    sendTokenResponse(user, 201, res);
});


exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse('Por favor ingrese email y contraseña', 400));
    }

    const user = await Usuario.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Credenciales inválidas', 401));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Credenciales inválidas', 401));
    }

    sendTokenResponse(user, 200, res);
});

exports.protect = asyncHandler(async (req, res, next) => {

});


exports.authorize = (...roles) => {
    return (req, res, next) => {
    };
};
