require('dotenv').config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require('./config/db');
const paymentRoutes = require('./routes/paymentRoutes');


connectDB();

const auth = require("./routes/auth");
const turnos = require("./routes/turnoRoutes");
const pacientes = require("./routes/pacientesRoutes");
const servicios = require("./routes/servicioRoutes");
const Usuario = require('./models/Usuario');
const Servicio = require('./models/Servicio');
const authController = require('./controllers/auth');

const app = express();


app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get('/api/v1/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find({role: 'user'}).select('-password');
    res.json({ success: true, count: usuarios.length, data: usuarios });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});


app.use("/api/v1/turnos", turnos);
app.use("/api/v1/auth", auth);
app.use("/api/v1/pacientes", pacientes);
app.use("/api/v1/servicios", servicios);
app.use("/api/v1/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.send("API de RollingVet está corriendo...");
});


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
