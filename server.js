require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');


connectDB();

const app = express();
const turnoRoutes = require('./routes/turnoRoutes');

app.use(cors()); 
app.use(express.json());
app.use('/api/turnos', turnoRoutes);

app.get('/', (req, res) => {
    res.send('API de RollingVet está corriendo...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));