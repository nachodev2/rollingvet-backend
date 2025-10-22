const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Token admin (cambiar por tu token real)
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjZiMjY4ZTdlOTMwNWQ3OGM5MThlMiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MTEyMjc5MywiZXhwIjoxNzYzNzE0NzkzfQ.K9eH7nPATa0D6dHVepDSlt0dIpZU8aM8xFx3GyluRQk';

const BASE_URL = 'http://localhost:5000/api/v1';

async function testServicios() {
  console.log('🚀 Iniciando pruebas de servicios y turnos...\n');

  try {
    // 1. Verificar servicios disponibles
    console.log('📋 1. Verificando servicios disponibles...');
    const serviciosResponse = await fetch(`${BASE_URL}/servicios/activos`);
    const serviciosData = await serviciosResponse.json();

    if (serviciosData.success) {
      console.log(`✅ Servicios encontrados: ${serviciosData.count}`);
      if (serviciosData.data.length === 0) {
        console.log('⚠️ No hay servicios disponibles. Creando servicios de ejemplo...\n');

        // Crear servicios de ejemplo
        await createServicioEjemplo('Consulta General', 'Consulta veterinaria completa', 2500, 'consulta', 30);
        await createServicioEjemplo('Vacunación', 'Vacuna antirrábica y múltiple', 1800, 'vacunacion', 15);
        await createServicioEjemplo('Desparasitación', 'Tratamiento interno y externo', 1200, 'desparasitacion', 20);

        console.log('✅ Servicios de ejemplo creados.\n');

        // Volver a verificar
        const nuevosServicios = await fetch(`${BASE_URL}/servicios/activos`);
        const nuevosData = await nuevosServicios.json();
        console.log(`📊 Ahora hay ${nuevosData.count} servicios disponibles:`);
        nuevosData.data.forEach(s => console.log(`   - ${s.nombre}: $${s.precio}`));
      } else {
        console.log('Servicios disponibles:');
        serviciosData.data.forEach(s => console.log(`   - ${s.nombre}: $${s.precio}`));
      }
    }

    console.log('\n🧪 2. Probando creación y pago de turno...');

    // Tomar el primer servicio disponible
    const primerServicio = serviciosData.data[0] || (await getServiciosEjemplo())[0];

    if (primerServicio) {
      const turnoData = {
        fecha: '2025-12-01',
        hora: '14:30',
        detalleCita: 'Consulta de prueba',
        servicio: primerServicio._id,
        veterinario: { nombre: 'Dr. Ana López', id: 'vet123' },
        mascota: { nombre: 'Max', especie: 'Perro' }
      };

      console.log('📝 Creando turno de prueba...');
      const turnoResponse = await fetch(`${BASE_URL}/turnos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        },
        body: JSON.stringify(turnoData)
      });

      const turnoResult = await turnoResponse.json();

      if (turnoResult.success) {
        console.log('✅ Turno creado exitosamente!');
        console.log(`🆔 Turno ID: ${turnoResult.data._id}`);
        console.log(`💰 Precio calculado: $${turnoResult.data.precioTotal}`);
        console.log(`📅 Servicio: ${turnoResult.data.servicioInfo.nombre}`);

        console.log('\n💳 3. Probando creación de pago...');

        const pagoResponse = await fetch(`${BASE_URL}/turnos/${turnoResult.data._id}/pagar`, {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`
          }
        });

        const pagoResult = await pagoResponse.json();

        if (pagoResult.success) {
          console.log('✅ Preferencia de pago creada exitosamente!');
          console.log(`🆔 Preference ID: ${pagoResult.preferenceId}`);
          console.log(`🔗 Checkout URL: ${pagoResult.init_point}`);
          console.log(`💰 Monto: $${pagoResult.turno.precio}`);
        } else {
          console.log('❌ Error creando pago:', pagoResult.error);
        }
      } else {
        console.log('❌ Error creando turno:', turnoResult.msg);
      }
    }

  } catch (error) {
    console.error('❌ Error en pruebas:', error.message);
  }
}

async function createServicioEjemplo(nombre, descripcion, precio, categoria, duracion) {
  try {
    const response = await fetch(`${BASE_URL}/servicios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify({
        nombre,
        descripcion,
        precio,
        categoria,
        duracionMinutos: duracion,
        activo: true
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Servicio "${nombre}" creado: $${precio}`);
    } else {
      console.log(`❌ Error creando servicio "${nombre}":`, result.msg);
    }

    return result;
  } catch (error) {
    console.error(`❌ Error creando servicio "${nombre}":`, error.message);
  }
}

async function getServiciosEjemplo() {
  const response = await fetch(`${BASE_URL}/servicios/activos`);
  const data = await response.json();
  return data.success ? data.data : [];
}

// Ejecutar pruebas
testServicios();
