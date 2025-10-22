const express = require('express');
const { register, login, changePassword, protect } = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/change-password', protect, changePassword);

module.exports = router;
