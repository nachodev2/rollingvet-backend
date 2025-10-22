const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');
const { protect, authorize } = require('../controllers/auth');


router.use(protect);


router.get('/activos', servicioController.obtenerServiciosActivos);
router.get('/categorias', servicioController.obtenerCategorias);


router.post('/', authorize('admin'), servicioController.crearServicio);
router.put('/:id', authorize('admin'), servicioController.actualizarServicio);
router.delete('/:id', authorize('admin'), servicioController.eliminarServicio);


router.get('/', servicioController.obtenerServicios);
router.get('/:id', servicioController.obtenerServicio);

module.exports = router;
