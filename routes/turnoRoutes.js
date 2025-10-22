const express = require('express');
const router = express.Router();
const { crearTurno, obtenerTurnos, actualizarTurno, eliminarTurno } = require('../controllers/turnoController');
const { protect, authorize } = require('../controllers/auth');

router.post('/', protect, crearTurno); // Users can create own turnos

router.get('/', protect, authorize('admin'), obtenerTurnos); // Only admin see all

router.route('/:id')
    .put(protect, authorize('admin'), actualizarTurno)
    .delete(protect, authorize('admin'), eliminarTurno);

module.exports = router;
