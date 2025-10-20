const express = require('express');
const router = express.Router();
const { crearTurno, obtenerTurnos, actualizarTurno, eliminarTurno } = require('../controllers/turnoController');


router.post('/', crearTurno);

router.get('/', obtenerTurnos);

router.route('/:id')
    .put(actualizarTurno)
    .delete(eliminarTurno);

module.exports = router;