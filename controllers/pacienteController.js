const Paciente = require('../models/Paciente');
const asyncHandler = require('../middleware/async'); 
const ErrorResponse = require('../utils/errorResponse');




exports.obtenerPacientes = asyncHandler(async (req, res, next) => {
    const pacientes = await Paciente.find({ role: 'user' }).select('-password'); 

    res.status(200).json({
        success: true,
        count: pacientes.length,
        data: pacientes
    });
});

exports.obtenerPaciente = asyncHandler(async (req, res, next) => {
    const paciente = await Paciente.findById(req.params.id);

    if (!paciente) {
        return next(
            new ErrorResponse(`Paciente no encontrado con id de ${req.params.id}`, 404)
        );
    }
    res.status(200).json({ success: true, data: paciente });
});

exports.crearPaciente = asyncHandler(async (req, res, next) => {
    const paciente = await Paciente.create(req.body);
    paciente.password = undefined;
    res.status(201).json({ success: true, data: paciente });
});

exports.actualizarPaciente = asyncHandler(async (req, res, next) => {
    let paciente = await Paciente.findById(req.params.id);

    if (!paciente) {
        return next(
            new ErrorResponse(`Paciente no encontrado con id de ${req.params.id}`, 404)
        );
    }

    paciente = await Paciente.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: paciente });
});


exports.eliminarPaciente = asyncHandler(async (req, res, next) => {
    const paciente = await Paciente.findById(req.params.id);

    if (!paciente) {
        return next(
            new ErrorResponse(`Paciente no encontrado con id de ${req.params.id}`, 404)
        );
    }

    await paciente.deleteOne(); 

    res.status(200).json({ success: true, data: {} });
});