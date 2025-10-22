const express = require('express');
const {
  obtenerServicios,
  obtenerServicio,
  crearServicio,
  actualizarServicio,
  eliminarServicio
} = require('../controllers/pacienteController');

const { protect, authorize } = require('../controllers/auth');

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), obtenerServicios)
  .post(protect, authorize('admin'), crearServicio);

router.route('/:id')
  .get(protect, authorize('admin'), obtenerServicio)
  .put(protect, authorize('admin'), actualizarServicio)
  .delete(protect, authorize('admin'), eliminarServicio);

module.exports = router;
