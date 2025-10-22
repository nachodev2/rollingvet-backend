const express = require('express');
const router = express.Router();
const { createPreference, receiveWebhook } = require('../controllers/paymentCOntroller');

router.post('/create-preference', createPreference);
router.post('/webhooks/mercadopago', receiveWebhook);

module.exports = router;
