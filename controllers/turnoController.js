// rollingvet-backend/controllers/turnoController.js

const Turno = require('../models/Turno');


const crearTurno = async (req, res) => {
    try {
        
        const { fecha, hora, detalleCita, veterinario, mascota } = req.body;
        
        
        const nuevoTurno = await Turno.create({
            fecha,
            hora,
            detalleCita,
            veterinario,
            mascota,
            
        });

        
        res.status(201).json({
            success: true,
            msg: 'Turno creado con éxito.',
            data: nuevoTurno
        });

    } catch (error) {
        console.error(error);
        
        res.status(400).json({ 
            success: false, 
            msg: 'Error al crear el turno. Verifica los datos.', 
            error: error.message 
        });
    }
};

module.exports = {
    crearTurno,
    
};