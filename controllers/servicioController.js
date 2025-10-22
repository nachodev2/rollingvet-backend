const Servicio = require('../models/Servicio');

exports.crearServicio = async (req, res) => {
    try {
        const servicio = await Servicio.create(req.body);

        res.status(201).json({
            success: true,
            msg: 'Servicio creado exitosamente',
            data: servicio
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                msg: 'Error en la validación de datos',
                errors
            });
        }

        res.status(500).json({
            success: false,
            msg: 'Error interno del servidor',
            error: error.message
        });
    }
};

exports.obtenerServicios = async (req, res) => {
    try {
        let query = {};

        if (req.query.categoria) {
            query.categoria = req.query.categoria;
        }

        if (req.query.activo !== undefined) {
            query.activo = req.query.activo === 'true';
        }

        if (req.query.q) {
            query.$text = { $search: req.query.q };
        }

        const servicios = await Servicio.find(query).sort({ nombre: 1 });

        res.status(200).json({
            success: true,
            count: servicios.length,
            data: servicios
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener los servicios',
            error: error.message
        });
    }
};

exports.obtenerServiciosActivos = async (req, res) => {
    try {
        const servicios = await Servicio.getServiciosActivos(
            req.query.categoria || null
        );

        res.status(200).json({
            success: true,
            count: servicios.length,
            data: servicios
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener los servicios activos',
            error: error.message
        });
    }
};

exports.obtenerServicio = async (req, res) => {
    try {
        const servicio = await Servicio.findById(req.params.id);

        if (!servicio) {
            return res.status(404).json({
                success: false,
                msg: 'Servicio no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: servicio
        });

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                msg: 'ID de servicio inválido'
            });
        }

        res.status(500).json({
            success: false,
            msg: 'Error interno del servidor',
            error: error.message
        });
    }
};

exports.actualizarServicio = async (req, res) => {
    try {
        const servicio = await Servicio.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!servicio) {
            return res.status(404).json({
                success: false,
                msg: 'Servicio no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            msg: 'Servicio actualizado exitosamente',
            data: servicio
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                msg: 'Error en la validación de datos',
                errors
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                msg: 'ID de servicio inválido'
            });
        }

        res.status(500).json({
            success: false,
            msg: 'Error interno del servidor',
            error: error.message
        });
    }
};

exports.eliminarServicio = async (req, res) => {
    try {
        const servicio = await Servicio.findById(req.params.id);

        if (!servicio) {
            return res.status(404).json({
                success: false,
                msg: 'Servicio no encontrado'
            });
        }

        servicio.activo = false;
        await servicio.save();

        res.status(200).json({
            success: true,
            msg: 'Servicio desactivado exitosamente'
        });

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                msg: 'ID de servicio inválido'
            });
        }

        res.status(500).json({
            success: false,
            msg: 'Error interno del servidor',
            error: error.message
        });
    }
};

exports.obtenerCategorias = async (req, res) => {
    try {
        const categorias = [
            { value: 'consulta', label: 'Consulta' },
            { value: 'cirugia', label: 'Cirugía' },
            { value: 'vacunacion', label: 'Vacunación' },
            { value: 'desparasitacion', label: 'Desparasitación' },
            { value: 'baño', label: 'Baño y Aseo' },
            { value: 'peluqueria', label: 'Peluquería' },
            { value: 'otros', label: 'Otros' }
        ];

        res.status(200).json({
            success: true,
            data: categorias
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error interno del servidor',
            error: error.message
        });
    }
};
