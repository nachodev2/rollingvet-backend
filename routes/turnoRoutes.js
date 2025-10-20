const express = require('express');
const router = express.Router();
const { crearTurno } = require('../controllers/turnoController');


router.post('/', crearTurno);

module.exports = router;