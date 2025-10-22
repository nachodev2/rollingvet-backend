const mongoose = require('mongoose');
require('dotenv').config();

const Servicio = require('./models/Servicio');

async function crearDatosEjemplo() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Crear servicios de ejemplo
    const serviciosEjemplo = [
      {
        nombre: 'Consulta General Veterinaria',
        descripcion: 'Consulta veterinaria completa con revisión física y diagnóstico inicial',
        precio: 2500,
        categoria: 'consulta',
        duracionMinutos: 30,
        activo: true
      },
      {
        nombre: 'Vacunación Completa',
        descripcion: 'Aplicación de vacunas antirrábica y múltiple para perros/gatos',
        precio: 1800,
        categoria: 'vacunacion',
        duracionMinutos: 15,
        activo: true
      },
      {
        nombre: 'Desparasitación Interna y Externa',
        descripcion: 'Tratamiento completo contra parásitos internos y externos',
        precio: 1200,
        categoria: 'desparasitacion',
        duracionMinutos: 20,
        requiereAyuno: true,
        activo: true
      },
      {
        nombre: 'Baño y Aseo Completo',
        descripcion: 'Baño, corte de uñas y limpieza de oídos profesional',
        precio: 2000,
        categoria: 'baño',
        duracionMinutos: 45,
        activo: true
      },
      {
        nombre: 'Cirugía Esterilización',
        descripcion: 'Cirugía de esterilización con anestesia completa y recuperación',
        precio: 15000,
        categoria: 'cirugia',
        duracionMinutos: 120,
        requiereAyuno: true,
        observaciones: 'Requiere ayuno de 12 horas antes de la cirugía',
        activo: true
      }
    ];

    console.log('🔄 Creando servicios de ejemplo...');

    for (const servicioData of serviciosEjemplo) {
      const servicioExistente = await Servicio.findOne({ nombre: servicioData.nombre });

      if (!servicioExistente) {
        const nuevoServicio = await Servicio.create(servicioData);
        console.log(`✅ Creado: ${nuevoServicio.nombre} - $${nuevoServicio.precio}`);
      } else {
        console.log(`⚠️ Ya existe: ${servicioExistente.nombre}`);
      }
    }

    console.log('\n🎯 Servicios disponibles para turnos:');
    const serviciosActivos = await Servicio.find({ activo: true }).sort({ nombre: 1 });
    serviciosActivos.forEach(s => {
      console.log(`   • ${s.nombre}: $${s.precio.toLocaleString('es-AR')} (${s.categoria})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

crearDatosEjemplo();
