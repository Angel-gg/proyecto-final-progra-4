import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calcularBinarioNivel, evaluarLogicaAlertas } from '@/lib/digitalSystems';

export async function GET() {
  try {
    const surtidores = await prisma.surtidor.findMany({
      include: {
        alertas: {
          where: { estado: 'ACTIVA' }
        }
      },
      orderBy: { numero: 'asc' }
    });
    return NextResponse.json(surtidores);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { numero, combustible, capacidad, nivelLitros } = body;

    const porcentaje = (nivelLitros / capacidad) * 100;
    const { code: codigoBinario } = calcularBinarioNivel(porcentaje);
    const { ledRojo, ledAmarillo } = evaluarLogicaAlertas(codigoBinario);

    let estado = 'OPERATIVO';
    if (ledRojo || ledAmarillo) estado = 'ALERTA';

    const surtidor = await prisma.surtidor.create({
      data: {
        numero: Number(numero),
        combustible,
        capacidad: Number(capacidad),
        nivelLitros: Number(nivelLitros),
        codigoBinario,
        estado
      }
    });

    // Check if alert needs to be created
    if (ledRojo) {
      await prisma.alerta.create({
        data: {
          surtidorId: surtidor.id,
          tipo: 'CRITICO',
          mensaje: `Surtidor #${surtidor.numero}: Nivel Crítico en ${porcentaje.toFixed(1)}% (LED Rojo - Compuerta NOR / Karnaugh Mintermino m0)`,
          logicaKarnaugh: "F(S1,S0) = (S1 + S0)' => [00]"
        }
      });
    } else if (ledAmarillo) {
      await prisma.alerta.create({
        data: {
          surtidorId: surtidor.id,
          tipo: 'BAJO',
          mensaje: `Surtidor #${surtidor.numero}: Nivel Bajo en ${porcentaje.toFixed(1)}% (LED Amarillo - Compuerta AND/NOT / Karnaugh Mintermino m1)`,
          logicaKarnaugh: "F(S1,S0) = S1' · S0 => [01]"
        }
      });
    }

    return NextResponse.json(surtidor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, numero, combustible, capacidad, nivelLitros } = body;

    const porcentaje = (nivelLitros / capacidad) * 100;
    const { code: codigoBinario } = calcularBinarioNivel(porcentaje);
    const { ledRojo, ledAmarillo } = evaluarLogicaAlertas(codigoBinario);

    let estado = 'OPERATIVO';
    if (ledRojo || ledAmarillo) estado = 'ALERTA';

    const surtidor = await prisma.surtidor.update({
      where: { id: Number(id) },
      data: {
        numero: Number(numero),
        combustible,
        capacidad: Number(capacidad),
        nivelLitros: Number(nivelLitros),
        codigoBinario,
        estado
      }
    });

    // Clear old active alerts for this surtidor if it's now ok
    if (!ledRojo && !ledAmarillo) {
      await prisma.alerta.updateMany({
        where: { surtidorId: surtidor.id, estado: 'ACTIVA' },
        data: { estado: 'RESUELTA' }
      });
    } else {
      // Create new alert if status changed
      if (ledRojo) {
        await prisma.alerta.create({
          data: {
            surtidorId: surtidor.id,
            tipo: 'CRITICO',
            mensaje: `Surtidor #${surtidor.numero}: Nivel Crítico en ${porcentaje.toFixed(1)}% (LED Rojo - Compuerta NOR / Karnaugh Mintermino m0)`,
            logicaKarnaugh: "F(S1,S0) = (S1 + S0)' => [00]"
          }
        });
      } else if (ledAmarillo) {
        await prisma.alerta.create({
          data: {
            surtidorId: surtidor.id,
            tipo: 'BAJO',
            mensaje: `Surtidor #${surtidor.numero}: Nivel Bajo en ${porcentaje.toFixed(1)}% (LED Amarillo - Compuerta AND/NOT / Karnaugh Mintermino m1)`,
            logicaKarnaugh: "F(S1,S0) = S1' · S0 => [01]"
          }
        });
      }
    }

    return NextResponse.json(surtidor);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await prisma.surtidor.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
