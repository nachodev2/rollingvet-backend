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
    const { nombre, email, password, role, telefono } = req.body;

    const user = await Usuario.create({
        nombre,
        email,
        password,
        role: role || 'user',
    });

    const paciente = await Paciente.create({
        nombreDueno: nombre,
        emailDueno: email,
        telefonoDueno: telefono,
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