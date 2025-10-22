const Paciente = require('../models/Paciente');
const Usuario = require('../models/Usuario');
const Servicio = require('../models/Servicio');
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

        

        
        
    }

    try {
        
        const usuario = await Usuario.create({
            nombre: req.body.nombreDueno,
            email: req.body.emailDueno,
            password: req.body.password, 
            role: req.body.role || 'user'
        });

        

        const paciente = await Paciente.create(req.body);

        
        paciente.usuarioId = usuario._id;
        await paciente.save();

        

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




exports.obtenerServicios = asyncHandler(async (req, res, next) => {
  const servicios = await Servicio.find();
  res.status(200).json({
    success: true,
    count: servicios.length,
    data: servicios
  });
});

exports.obtenerServicio = asyncHandler(async (req, res, next) => {
  const servicio = await Servicio.findById(req.params.id);

  if (!servicio) {
    return next(
      new ErrorResponse(`Servicio no encontrado con id de ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: servicio });
});

exports.crearServicio = asyncHandler(async (req, res, next) => {
  const servicio = await Servicio.create(req.body);
  res.status(201).json({ success: true, data: servicio });
});

exports.actualizarServicio = asyncHandler(async (req, res, next) => {
  let servicio = await Servicio.findById(req.params.id);

  if (!servicio) {
    return next(
      new ErrorResponse(`Servicio no encontrado con id de ${req.params.id}`, 404)
    );
  }

  servicio = await Servicio.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: servicio });
});

exports.eliminarServicio = asyncHandler(async (req, res, next) => {
  const servicio = await Servicio.findById(req.params.id);

  if (!servicio) {
    return next(
      new ErrorResponse(`Servicio no encontrado con id de ${req.params.id}`, 404)
    );
  }

  await servicio.deleteOne();

  res.status(200).json({ success: true, data: {} });
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
