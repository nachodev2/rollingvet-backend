const { MercadoPagoConfig, Preference } = require('mercadopago');

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

/**
 * Controlador para crear preferencias de pago
 */
exports.createPreference = async (req, res) => {
    try {
        console.log('🔥 Creando preferencia de pago...');
        console.log('📝 Payload recibido:', req.body);

        const { title, unit_price, quantity = 1 } = req.body;

        // Validaciones
        if (!title || !unit_price) {
            return res.status(400).json({
                success: false,
                error: "Título y precio unitario son requeridos"
            });
        }

        if (unit_price <= 0) {
            return res.status(400).json({
                success: false,
                error: "El precio debe ser mayor a 0"
            });
        }

        // Crear el objeto de preferencia
        let preference = {
            items: [{
                title: title,
                unit_price: parseFloat(unit_price),
                quantity: parseInt(quantity),
                currency_id: "ARS"
            }],

            // URLs de redirección después del pago
            back_urls: {
                success: process.env.URL_SUCCESS,
                failure: process.env.URL_FAILURE,
                pending: process.env.URL_PENDING
            },

            // URL para recibir notificaciones webhook
            notification_url: `${process.env.BASE_URL}/api/v1/payments/webhooks/mercadopago`,

            // Configuración adicional
            auto_return: "approved",
            payment_methods: {
                excluded_payment_methods: [],
                excluded_payment_types: []
            },

            // Información del comprador (si tienes datos del usuario)
            // payer: {
            //     email: req.body.email || '',
            //     name: req.body.nombre || ''
            // },

            statement_descriptor: "RollingVet",
            external_reference: `rollingvet-${Date.now()}`
        };

        // Crear la preferencia en Mercado Pago
        const preferenceClient = new Preference(client);
        const response = await preferenceClient.create({ body: preference });

        // Respuesta exitosa
        res.json({
            success: true,
            preferenceId: response.body.id,
            init_point: response.body.init_point,
            external_reference: preference.external_reference
        });

    } catch (error) {
        console.error('❌ Error al crear preferencia de pago:', error);

        res.status(500).json({
            success: false,
            error: "Error al crear la preferencia de pago.",
            details: error.message
        });
    }
};

/**
 * Controlador para manejar webhooks de Mercado Pago
 */
exports.receiveWebhook = async (req, res) => {
    try {
        const webhookData = req.body;

        if (webhookData && webhookData.type === 'payment') {
            console.log('💰 Webhook de pago recibido:', webhookData.data?.id);
        }

        res.status(200).send('OK');

    } catch (error) {
        console.error('❌ Error procesando webhook:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
