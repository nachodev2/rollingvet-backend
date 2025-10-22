const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');

// Middleware de autenticación
const { protect, authorize } = require('../controllers/auth');

// Rutas públicas
router.get('/activos', servicioController.obtenerServiciosActivos);
router.get('/categorias', servicioController.obtenerCategorias);

// Rutas que requieren autenticación
router.use(protect); // Todas las rutas siguientes requieren autenticación

// Rutas CRUD - Solo admin puede crear/actualizar/eliminar
router.post('/', authorize('admin'), servicioController.crearServicio);
router.put('/:id', authorize('admin'), servicioController.actualizarServicio);
router.delete('/:id', authorize('admin'), servicioController.eliminarServicio);

// Rutas de consulta - Accesibles para usuarios autenticados
router.get('/', servicioController.obtenerServicios);
router.get('/:id', servicioController.obtenerServicio);

module.exports = router;
