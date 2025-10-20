const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    console.log(err);

    if (err.name === 'CastError') {
        const message = `Recurso no encontrado con id de ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    if (err.code === 11000) {
        const message = 'Ya existe un campo con ese valor. El email ya fue registrado';
        error = new ErrorResponse(message, 400);
    }

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Error del servidor'
    });
}


module.exports = errorHandler;