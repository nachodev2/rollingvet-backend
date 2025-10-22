require('dotenv').config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require('./config/db');

// Conectar a la base de datos
connectDB();

const auth = require("./routes/auth");
const turnos = require("./routes/turnoRoutes");
const pacientes = require("./routes/pacientesRoutes");
const Usuario = require('./models/Usuario');
const authController = require('./controllers/auth');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Log de todas las requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// RUTA DE USUARIOS - DEBE IR PRIMERO
console.log('🔧 Registrando ruta GET /api/v1/usuarios...');

app.get('/api/v1/usuarios', 
  authController.protect, 
  authController.authorize('admin'), 
  async (req, res, next) => {
    try {
      console.log('✅ Ejecutando handler /api/v1/usuarios');
      console.log('Usuario autenticado:', req.user.email, 'Role:', req.user.role);
      const usuarios = await Usuario.find().select('-password');
      console.log(`📊 Usuarios encontrados: ${usuarios.length}`);
      return res.status(200).json({ 
        success: true, 
        count: usuarios.length, 
        data: usuarios 
      });
    } catch (err) {
      console.error('❌ Error en /api/v1/usuarios:', err);
      next(err);
    }
  }
);

console.log('✅ Ruta /api/v1/usuarios registrada');

// Otras rutas
app.use("/api/v1/turnos", turnos);
app.use("/api/v1/auth", auth);
app.use("/api/v1/pacientes", pacientes);

app.get("/", (req, res) => {
  res.send("API de RollingVet está corriendo...");
});

// Error handler simple (en caso de que el archivo no exista)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Error del servidor'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`📍 Ruta disponible: http://localhost:${PORT}/api/v1/usuarios`);
});