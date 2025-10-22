const express = require('express');
const { 
    obtenerPacientes, 
    obtenerPaciente, 
    actualizarPaciente, 
    eliminarPaciente 
} = require('../controllers/pacienteController');


const { protect, authorize } = require('../controllers/auth'); 

const router = express.Router();


router.route('/')
    .get(protect, authorize('admin'), obtenerPacientes);

router.route('/:id')
    .get(protect, authorize('admin'), obtenerPaciente)
    .put(protect, authorize('admin'), actualizarPaciente)
    .delete(protect, authorize('admin'), eliminarPaciente);

module.exports = router;