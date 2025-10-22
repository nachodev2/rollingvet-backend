

const Turno = require('../models/Turno');
const Servicio = require('../models/Servicio');
const { MercadoPagoConfig, Preference } = require('mercadopago');

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

const crearTurno = async (req, res) => {
    try {
        console.log('📝 Creando turno con datos:', req.body);

        const { fecha, hora, detalleCita, servicio: servicioId, veterinario, mascota, observaciones } = req.body;

        // Validaciones
        if (!servicioId) {
            return res.status(400).json({
                success: false,
                msg: 'El servicio es obligatorio.'
            });
        }

        // Verificar que el servicio existe y está activo
        const servicio = await Servicio.findById(servicioId);
        if (!servicio) {
            return res.status(404).json({
                success: false,
                msg: 'Servicio no encontrado.'
            });
        }

        if (!servicio.activo) {
            return res.status(400).json({
                success: false,
                msg: 'El servicio seleccionado no está disponible.'
            });
        }

        console.log('✅ Servicio válido:', servicio.nombre, 'Precio:', servicio.precio);

        // Crear el turno
        const nuevoTurno = await Turno.create({
            fecha,
            hora,
            detalleCita,
            servicio: servicioId,
            veterinario,
            mascota,
            observaciones,
            precioTotal: servicio.precio // Se calcula automáticamente en el pre-save
        });

        // Poblar la información del servicio para la respuesta
        await nuevoTurno.populate('servicio');

        console.log('✅ Turno creado exitosamente:', nuevoTurno._id);

        res.status(201).json({
            success: true,
            msg: 'Turno creado con éxito.',
            data: nuevoTurno
        });

    } catch (error) {
        console.error('❌ Error creando turno:', error);

        // Manejar errores específicos
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                msg: 'Error en la validación de datos.',
                errors
            });
        }

        if (error.message === 'Servicio no encontrado') {
            return res.status(404).json({
                success: false,
                msg: 'Servicio no encontrado.'
            });
        }

        res.status(500).json({
            success: false,
            msg: 'Error interno del servidor.',
            error: error.message
        });
    }
};

const obtenerTurnos = async (req, res) => {
    try {
        const turnos = await Turno.find().sort({ fecha: 1, hora: 1 }); 
        
        res.status(200).json({
            success: true,
            count: turnos.length,
            data: turnos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            msg: 'Error al obtener los turnos.',
            error: error.message 
        });
    }
};

const actualizarTurno = async (req, res) => {
    try {
        const turno = await Turno.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!turno) {
            return res.status(404).json({ success: false, msg: 'Turno no encontrado.' });
        }
        
        res.status(200).json({
            success: true,
            msg: 'Turno actualizado con éxito.',
            data: turno
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({ 
            success: false, 
            msg: 'Error al actualizar el turno. Verifique los datos.', 
            error: error.message 
        });
    }
}

const eliminarTurno = async (req, res) => {
    try {
        const turno = await Turno.findByIdAndDelete(req.params.id);

        if (!turno) {
            return res.status(404).json({ success: false, msg: 'Turno no encontrado.' });
        }

        res.status(200).json({
            success: true,
            msg: 'Turno eliminado con éxito.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            msg: 'Error del servidor al eliminar el turno.',
            error: error.message 
        });
    }
};

// Crear preferencia de pago para un turno específico
const pagarTurno = async (req, res) => {
    try {
        console.log('💳 Iniciando proceso de pago para turno:', req.params.id);

        const turno = await Turno.findById(req.params.id).populate('servicio');
        if (!turno) {
            return res.status(404).json({
                success: false,
                msg: 'Turno no encontrado.'
            });
        }

        // Verificar que el turno no esté ya pagado
        if (turno.pagado) {
            return res.status(400).json({
                success: false,
                msg: 'Este turno ya ha sido pagado.'
            });
        }

        // Verificar que el estado permita pago
        if (turno.estado === 'cancelado' || turno.estado === 'completado') {
            return res.status(400).json({
                success: false,
                msg: 'No se puede pagar este turno en su estado actual.'
            });
        }

        // Crear preferencia de pago para este turno
        const preference = {
            items: [{
                title: `Turno - ${turno.servicioInfo.nombre || turno.servicio.nombre}`,
                description: `Fecha: ${turno.fecha} - Hora: ${turno.hora} - Mascota: ${turno.mascota.nombre}`,
                unit_price: parseFloat(turno.precioTotal),
                quantity: 1,
                currency_id: "ARS"
            }],

            back_urls: {
                success: `${process.env.BASE_URL}/pago-exitoso?turno_id=${turno._id}`,
                failure: `${process.env.BASE_URL}/pago-fallido?turno_id=${turno._id}`,
                pending: `${process.env.BASE_URL}/pago-pendiente?turno_id=${turno._id}`
            },

            notification_url: `${process.env.BASE_URL}/api/v1/turnos/${turno._id}/webhook-pago`,

            auto_return: "approved",

            statement_descriptor: "RollingVet - Pago de Turno",
            external_reference: `turno-${turno._id}`,
            payment_methods: {
                excluded_payment_methods: [],
                excluded_payment_types: []
            },

            metadata: {
                turno_id: turno._id.toString(),
                servicio: turno.servicioInfo.nombre,
                fecha: turno.fecha,
                hora: turno.hora,
                veterinario: turno.veterinario.nombre,
                mascota: turno.mascota.nombre
            }
        };

        console.log('📤 Creando preferencia de pago para turno...');

        const preferenceClient = new Preference(client);
        const response = await preferenceClient.create({ body: preference });

        console.log('✅ Preferencia de pago creada:', response.body.id);

        res.json({
            success: true,
            preferenceId: response.body.id,
            init_point: response.body.init_point,
            turno: {
                id: turno._id,
                servicio: turno.servicioInfo.nombre,
                precio: turno.precioTotal,
                fecha: turno.fecha,
                hora: turno.hora
            }
        });

    } catch (error) {
        console.error('❌ Error creando pago para turno:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al procesar el pago.',
            error: error.message
        });
    }
};

// Webhook específico para procesar pago de turnos
const procesarPagoTurno = async (req, res) => {
    try {
        console.log('🔔 Webhook de pago recibido para turno');

        const payment = req.body;

        if (payment.type === 'payment') {
            const paymentData = payment.data;
            const externalReference = payment.external_reference;

            console.log(`💰 Procesando pago: ${paymentData.id} - Estado: ${paymentData.status}`);

            // Verificar que es un pago de turno
            if (externalReference && externalReference.startsWith('turno-')) {
                const turnoId = externalReference.replace('turno-', '');
                const turno = await Turno.findById(turnoId);

                if (turno) {
                    if (paymentData.status === 'approved') {
                        await turno.confirmarPago(paymentData.id);
                        console.log('✅ Turno confirmado y pagado:', turnoId);
                    } else if (paymentData.status === 'rejected') {
                        console.log('❌ Pago rechazado para turno:', turnoId);
                    } else if (paymentData.status === 'pending') {
                        console.log('⏳ Pago pendiente para turno:', turnoId);
                    }
                } else {
                    console.log('⚠️ Turno no encontrado:', turnoId);
                }
            }
        }

        res.status(200).send('OK');

    } catch (error) {
        console.error('❌ Error procesando webhook de turno:', error);
        res.status(500).json({ error: 'Error procesando webhook' });
    }
};

// Obtener información detallada de un turno
const obtenerTurno = async (req, res) => {
    try {
        const turno = await Turno.findById(req.params.id).populate('servicio');

        if (!turno) {
            return res.status(404).json({
                success: false,
                msg: 'Turno no encontrado.'
            });
        }

        res.status(200).json({
            success: true,
            data: turno
        });

    } catch (error) {
        console.error('❌ Error obteniendo turno:', error);
        res.status(500).json({
            success: false,
            msg: 'Error interno del servidor.',
            error: error.message
        });
    }
};

module.exports = {
    crearTurno,
    obtenerTurnos,
    obtenerTurno,
    actualizarTurno,
    eliminarTurno,
    pagarTurno,
    procesarPagoTurno
};
