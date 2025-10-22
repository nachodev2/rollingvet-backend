

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
            msg: 'Error al crear el turno. Verificá los datos.', 
            error: error.message 
        });
    }
};

const obtenerTurnos = async (req, res) => {
    try {
        const turnos = await Turno.find().sort({ fecha: 1, hora: 1 }); 
        
        res.status(200).json({
            success: true,
            count: turnos.length,
            data: turnos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            msg: 'Error al obtener los turnos.',
            error: error.message 
        });
    }
};

const actualizarTurno = async (req, res) => {
    try {
        const turno = await Turno.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!turno) {
            return res.status(404).json({ success: false, msg: 'Turno no encontrado.' });
        }
        
        res.status(200).json({
            success: true,
            msg: 'Turno actualizado con éxito.',
            data: turno
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({ 
            success: false, 
            msg: 'Error al actualizar el turno. Verifique los datos.', 
            error: error.message 
        });
    }
}

const eliminarTurno = async (req, res) => {
    try {
        const turno = await Turno.findByIdAndDelete(req.params.id);

        if (!turno) {
            return res.status(404).json({ success: false, msg: 'Turno no encontrado.' });
        }

        res.status(200).json({
            success: true,
            msg: 'Turno eliminado con éxito.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            msg: 'Error del servidor al eliminar el turno.',
            error: error.message 
        });
    }
};

module.exports = {
    crearTurno,
    obtenerTurnos,
    actualizarTurno,
    eliminarTurno,
    
};