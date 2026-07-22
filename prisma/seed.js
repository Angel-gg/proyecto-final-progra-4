const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear existing
  await prisma.alerta.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.surtidor.deleteMany();

  // Create initial surtidores
  // Binario: 00 = vacio/critico (0-25%), 01 = bajo (25-50%), 10 = medio (50-75%), 11 = lleno (75-100%)
  const surtidor1 = await prisma.surtidor.create({
    data: {
      numero: 1,
      combustible: 'Gasolina Especial (Bs 3.74/L)',
      capacidad: 10000,
      nivelLitros: 8500,
      codigoBinario: '11',
      estado: 'OPERATIVO',
    }
  });

  const surtidor2 = await prisma.surtidor.create({
    data: {
      numero: 2,
      combustible: 'Diesel Oil (Bs 3.72/L)',
      capacidad: 12000,
      nivelLitros: 4200,
      codigoBinario: '01',
      estado: 'ALERTA',
    }
  });

  const surtidor3 = await prisma.surtidor.create({
    data: {
      numero: 3,
      combustible: 'Gasolina Premium Ultra (Bs 4.79/L)',
      capacidad: 8000,
      nivelLitros: 1200,
      codigoBinario: '00',
      estado: 'ALERTA',
    }
  });

  const surtidor4 = await prisma.surtidor.create({
    data: {
      numero: 4,
      combustible: 'GNV Vehicular (Bs 1.66/m3)',
      capacidad: 15000,
      nivelLitros: 11000,
      codigoBinario: '10',
      estado: 'OPERATIVO',
    }
  });

  // Create initial alerts
  await prisma.alerta.createMany({
    data: [
      {
        surtidorId: surtidor2.id,
        tipo: 'BAJO',
        mensaje: 'Nivel de Diesel en 35% (LED Amarillo activado por Compuerta OR/AND)',
        logicaKarnaugh: 'F(S1,S0) = S1\' · S0  => [01]',
        estado: 'ACTIVA',
      },
      {
        surtidorId: surtidor3.id,
        tipo: 'CRITICO',
        mensaje: 'Nivel Crítico de Premium en 15% (LED Rojo - Compuerta NOR / Karnaugh Mintermino m0)',
        logicaKarnaugh: 'F(S1,S0) = (S1 + S0)\' = S1\' · S0\' => [00]',
        estado: 'ACTIVA',
      }
    ]
  });

  // Create initial ventas
  await prisma.venta.createMany({
    data: [
      {
        surtidorId: surtidor1.id,
        combustible: 'Gasolina Especial',
        litros: 40,
        precioPorLitro: 3.74,
        total: 149.6,
        totalBinario: '10010101.10011001',
      },
      {
        surtidorId: surtidor2.id,
        combustible: 'Diesel Oil',
        litros: 100,
        precioPorLitro: 3.72,
        total: 372.0,
        totalBinario: '101110100.0',
      },
      {
        surtidorId: surtidor4.id,
        combustible: 'GNV Vehicular',
        litros: 25,
        precioPorLitro: 1.66,
        total: 41.5,
        totalBinario: '101001.1',
      }
    ]
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
