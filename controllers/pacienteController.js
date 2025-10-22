const Paciente = require('../models/Paciente');
const Usuario = require('../models/Usuario');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const bcrypt = require('bcryptjs');




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
    if (!req.body.password && req.body.nombreDueno) {
        const tempPassword = req.body.nombreDueno.replace(/\s+/g, '').toLowerCase();
        req.body.password = await bcrypt.hash(tempPassword, 10);

        console.log(`Hash generado para '${tempPassword}': ${req.body.password}`);

        // Enviar el password temporal al admin (opcional)
        console.log(`Password temporal para nuevo paciente '${req.body.nombreDueno}': ${tempPassword}`);
    }

    try {
        // Intentar crear Usuario correspondiente para login
        const usuario = await Usuario.create({
            nombre: req.body.nombreDueno,
            email: req.body.emailDueno,
            password: req.body.password, // Ya hasheada
            role: req.body.role || 'user'
        });

        console.log('✅ Usuario creado:', usuario.email);

        const paciente = await Paciente.create(req.body);

        // Link paciente a usuario
        paciente.usuarioId = usuario._id;
        await paciente.save();

        console.log('✅ Paciente creado y linked a usuario');

        paciente.password = undefined;
        res.status(201).json({ success: true, data: paciente });
    } catch (err) {
        console.error('❌ Error al crear Usuario o Paciente:', err.message);

        // Intentar crear solo Paciente si Usuario falla
        try {
            const paciente = await Paciente.create(req.body);
            console.log('✅ Paciente creado sin Usuario link');
            paciente.password = undefined;
            res.status(201).json({ success: true, data: paciente });
        } catch (pacErr) {
            console.error('❌ Error al crear Paciente:', pacErr.message);
            return next(pacErr);
        }
        return next(err); // Return original error
    }
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
