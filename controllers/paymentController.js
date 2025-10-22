const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

exports.createPreference = async (req, res) => {
    try {
        const { title, unit_price, quantity = 1 } = req.body;

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

        let preference = {
            items: [{
                title: title,
                unit_price: parseFloat(unit_price),
                quantity: parseInt(quantity),
                currency_id: "ARS"
            }],

            back_urls: {
                success: process.env.URL_SUCCESS,
                failure: process.env.URL_FAILURE,
                pending: process.env.URL_PENDING
            },

            notification_url: `${process.env.BASE_URL}/api/v1/payments/webhooks/mercadopago`,

            auto_return: "approved",
            payment_methods: {
                excluded_payment_methods: [],
                excluded_payment_types: []
            },

            statement_descriptor: "RollingVet",
            external_reference: `rollingvet-${Date.now()}`
        };

        const preferenceClient = new Preference(client);
        const response = await preferenceClient.create({ body: preference });

        res.json({
            success: true,
            preferenceId: response.body.id,
            init_point: response.body.init_point,
            external_reference: preference.external_reference
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Error al crear la preferencia de pago.",
            details: error.message
        });
    }
};

exports.receiveWebhook = async (req, res) => {
    try {
        const webhookData = req.body;

        if (webhookData && webhookData.type === 'payment') {
        }

        res.status(200).send('OK');

    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
