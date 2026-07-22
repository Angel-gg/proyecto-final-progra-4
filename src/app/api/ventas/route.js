import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decimalABinario, calcularBinarioNivel, evaluarLogicaAlertas } from '@/lib/digitalSystems';

export async function GET() {
  try {
    const ventas = await prisma.venta.findMany({
      include: { surtidor: true },
      orderBy: { fecha: 'desc' }
    });
    return NextResponse.json(ventas);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { surtidorId, litros, precioPorLitro } = body;

    const surtidor = await prisma.surtidor.findUnique({
      where: { id: Number(surtidorId) }
    });

    if (!surtidor) {
      return NextResponse.json({ error: 'Surtidor no encontrado' }, { status: 404 });
    }

    if (surtidor.nivelLitros < Number(litros)) {
      return NextResponse.json({ error: 'Nivel insuficiente en el surtidor' }, { status: 400 });
    }

    const totalDecimal = Number(litros) * Number(precioPorLitro);
    const totalBinario = decimalABinario(totalDecimal);

    // Descontar litros del surtidor y recapacitar nivel binario y alertas SD
    const nuevoNivelLitros = surtidor.nivelLitros - Number(litros);
    const porcentaje = (nuevoNivelLitros / surtidor.capacidad) * 100;
    const { code: nuevoCodigoBinario } = calcularBinarioNivel(porcentaje);
    const { ledRojo, ledAmarillo } = evaluarLogicaAlertas(nuevoCodigoBinario);

    let estado = 'OPERATIVO';
    if (ledRojo || ledAmarillo) estado = 'ALERTA';

    // Transaction
    const [venta] = await prisma.$transaction([
      prisma.venta.create({
        data: {
          surtidorId: surtidor.id,
          combustible: surtidor.combustible,
          litros: Number(litros),
          precioPorLitro: Number(precioPorLitro),
          total: totalDecimal,
          totalBinario: totalBinario
        }
      }),
      prisma.surtidor.update({
        where: { id: surtidor.id },
        data: {
          nivelLitros: nuevoNivelLitros,
          codigoBinario: nuevoCodigoBinario,
          estado
        }
      })
    ]);

    // Generate alerts if low level reached after sale
    if (ledRojo) {
      await prisma.alerta.create({
        data: {
          surtidorId: surtidor.id,
          tipo: 'CRITICO',
          mensaje: `Alerta post-venta: Surtidor #${surtidor.numero} nivel crítico (${porcentaje.toFixed(1)}%). (LED Rojo / Karnaugh m0 [00])`,
          logicaKarnaugh: "F(S1,S0) = (S1 + S0)' => [00]"
        }
      });
    } else if (ledAmarillo) {
      await prisma.alerta.create({
        data: {
          surtidorId: surtidor.id,
          tipo: 'BAJO',
          mensaje: `Alerta post-venta: Surtidor #${surtidor.numero} nivel bajo (${porcentaje.toFixed(1)}%). (LED Amarillo / Karnaugh m1 [01])`,
          logicaKarnaugh: "F(S1,S0) = S1' · S0 => [01]"
        }
      });
    }

    return NextResponse.json(venta, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
