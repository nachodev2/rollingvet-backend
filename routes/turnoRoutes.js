const express = require('express');
const router = express.Router();
const { crearTurno, obtenerTurnos, obtenerTurno, actualizarTurno, eliminarTurno, pagarTurno, procesarPagoTurno } = require('../controllers/turnoController');

router.post('/', crearTurno);
router.get('/', obtenerTurnos);

router.get('/:id', obtenerTurno);
router.post('/:id/pagar', pagarTurno);
router.post('/:id/webhook-pago', procesarPagoTurno);

router.route('/:id')
    .put(actualizarTurno)
    .delete(eliminarTurno);

module.exports = router;
