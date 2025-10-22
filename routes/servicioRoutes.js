const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');
const { protect, authorize } = require('../controllers/auth');

// ✅ TODAS las rutas requieren autenticación
router.use(protect);

// 📋 Rutas disponibles para usuarios autenticados (clientes)
router.get('/activos', servicioController.obtenerServiciosActivos);
router.get('/categorias', servicioController.obtenerCategorias);

// 🔧 Rutas de gestión - Solo admin
router.post('/', authorize('admin'), servicioController.crearServicio);
router.put('/:id', authorize('admin'), servicioController.actualizarServicio);
router.delete('/:id', authorize('admin'), servicioController.eliminarServicio);

// 📊 Rutas de consulta - Accesibles para usuarios autenticados
router.get('/', servicioController.obtenerServicios);
router.get('/:id', servicioController.obtenerServicio);

module.exports = router;
