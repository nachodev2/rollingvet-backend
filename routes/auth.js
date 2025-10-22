const express = require('express');
const {
    register,
    login,
    changePassword,
    crearUsuario,
    obtenerUsuarios,
    debugUser,
    protect,
    authorize
} = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/change-password', protect, changePassword);


router.get('/debug/:email', debugUser);


router.post('/admin/users', protect, authorize('admin'), crearUsuario);
router.get('/admin/users', protect, authorize('admin'), obtenerUsuarios);

module.exports = router;
