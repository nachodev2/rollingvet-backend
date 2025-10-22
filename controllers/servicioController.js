const Servicio = require('../models/Servicio');

// @desc    Crear un nuevo servicio
// @route   POST /api/v1/servicios
// @access  Private (Admin)
exports.crearServicio = async (req, res) => {
    try {
        console.log('📝 Creando nuevo servicio:', req.body);

        const servicio = await Servicio.create(req.body);

        res.status(201).json({
            success: true,
            msg: 'Servicio creado exitosamente',
            data: servicio
        });

    } catch (error) {
        console.error('❌ Error creando servicio:', error);

        // Manejar errores de validación
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

// @desc    Obtener todos los servicios
// @route   GET /api/v1/servicios
// @access  Public
exports.obtenerServicios = async (req, res) => {
    try {
        console.log('📋 Obteniendo servicios...');

        let query = {};

        // Filtros opcionales
        if (req.query.categoria) {
            query.categoria = req.query.categoria;
        }

        if (req.query.activo !== undefined) {
            query.activo = req.query.activo === 'true';
        }

        // Búsqueda por texto
        if (req.query.q) {
            query.$text = { $search: req.query.q };
        }

        const servicios = await Servicio.find(query).sort({ nombre: 1 });

        console.log(`✅ Encontrados ${servicios.length} servicios`);

        res.status(200).json({
            success: true,
            count: servicios.length,
            data: servicios
        });

    } catch (error) {
        console.error('❌ Error obteniendo servicios:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener los servicios',
            error: error.message
        });
    }
};

// @desc    Obtener servicios activos (para dropdowns/formularios)
// @route   GET /api/v1/servicios/activos
// @access  Public
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
        console.error('❌ Error obteniendo servicios activos:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener los servicios activos',
            error: error.message
        });
    }
};

// @desc    Obtener un servicio específico
// @route   GET /api/v1/servicios/:id
// @access  Public
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
        console.error('❌ Error obteniendo servicio:', error);

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

// @desc    Actualizar un servicio
// @route   PUT /api/v1/servicios/:id
// @access  Private (Admin)
exports.actualizarServicio = async (req, res) => {
    try {
        console.log('🔄 Actualizando servicio:', req.params.id);

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
        console.error('❌ Error actualizando servicio:', error);

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

// @desc    Eliminar un servicio
// @route   DELETE /api/v1/servicios/:id
// @access  Private (Admin)
exports.eliminarServicio = async (req, res) => {
    try {
        console.log('🗑️ Eliminando servicio:', req.params.id);

        // Primero desactivar el servicio en lugar de eliminarlo físicamente
        const servicio = await Servicio.findById(req.params.id);

        if (!servicio) {
            return res.status(404).json({
                success: false,
                msg: 'Servicio no encontrado'
            });
        }

        // Desactivar el servicio
        servicio.activo = false;
        await servicio.save();

        console.log('✅ Servicio desactivado exitosamente');

        res.status(200).json({
            success: true,
            msg: 'Servicio desactivado exitosamente'
        });

    } catch (error) {
        console.error('❌ Error eliminando servicio:', error);

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

// @desc    Obtener categorías disponibles
// @route   GET /api/v1/servicios/categorias
// @access  Public
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
        console.error('❌ Error obteniendo categorías:', error);
        res.status(500).json({
            success: false,
            msg: 'Error interno del servidor',
            error: error.message
        });
    }
};
