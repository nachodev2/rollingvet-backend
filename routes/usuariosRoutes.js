const express = require('express');
const {
    obtenerUsuarios
} = require('../controllers/auth');

const { protect, authorize } = require('../controllers/auth');

const router = express.Router();

router.get('/', (req, res) => {
  console.log('usuarios route hit');
  res.json({test: 'usuarios'});
});

router.get('/test', (req, res) => {
  console.log('Route test hit');
  res.json({test: 'ok'});
});

module.exports = router;
