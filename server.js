require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const auth = require('./routes/auth');
const cookieParser = require('cookie-parser');
const turnos = require('./routes/turnoRoutes');


connectDB();

const app = express();
const turnoRoutes = require('./routes/turnoRoutes');

app.use(cors()); 
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/turnos', turnoRoutes);
app.use('/api/v1/auth', auth);

app.get('/', (req, res) => {
    res.send('API de RollingVet está corriendo...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));