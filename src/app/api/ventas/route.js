/**
 * API Route: /api/ventas
 * Usa: PrismaAdapter (Adapter) + NivelSurtidorSubject (Observer) + PrecioContext (Strategy)
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/adapters/PrismaAdapter';
import {
  NivelSurtidorSubject,
  AlertaPersistenciaObserver,
  LogObserver,
} from '@/lib/observers/AlertaObserver';
import {
  decimalABinario,
  calcularBinarioNivel,
  evaluarLogicaAlertas,
} from '@/lib/digitalSystems';
import { PrecioContext } from '@/lib/strategies/PrecioStrategy';

// ─── Sistema Observer ───
const nivelSubject = new NivelSurtidorSubject();
nivelSubject.subscribe(new AlertaPersistenciaObserver(db));
nivelSubject.subscribe(new LogObserver());

// ─── GET /api/ventas ──────────────────────────────────────────────
export async function GET() {
  try {
    const ventas = await db.findAllVentas();
    return NextResponse.json(ventas);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── POST /api/ventas ─────────────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json();
    const { surtidorId, litros, precioPorLitro } = body;

    // 1. Buscar surtidor vía Adapter
    const surtidor = await db.findSurtidorById(surtidorId);
    if (!surtidor) {
      return NextResponse.json({ error: 'Surtidor no encontrado' }, { status: 404 });
    }

    const litrosNum = Number(litros);
    if (surtidor.nivelLitros < litrosNum) {
      return NextResponse.json({ error: 'Nivel insuficiente en el surtidor' }, { status: 400 });
    }

    // 2. Strategy: calcular precio usando la estrategia del combustible
    const strategy      = PrecioContext.getStrategy(surtidor.combustible);
    const precioFinal   = precioPorLitro ? Number(precioPorLitro) : strategy.getPrecioPorLitro();
    const totalDecimal  = litrosNum * precioFinal;

    // 3. Sistemas Digitales — Aritmética Binaria + nuevo nivel
    const totalBinario      = decimalABinario(totalDecimal);
    const nuevoNivelLitros  = surtidor.nivelLitros - litrosNum;
    const porcentaje        = (nuevoNivelLitros / surtidor.capacidad) * 100;
    const { code: nuevoCodigoBinario } = calcularBinarioNivel(porcentaje);
    const { ledRojo, ledAmarillo }     = evaluarLogicaAlertas(nuevoCodigoBinario);
    const nuevoEstado = (ledRojo || ledAmarillo) ? 'ALERTA' : 'OPERATIVO';

    // 4. Transacción atómica via Adapter
    const [venta] = await db.registrarVentaConActualizacion(
      {
        surtidorId:    surtidor.id,
        combustible:   surtidor.combustible,
        litros:        litrosNum,
        precioPorLitro: precioFinal,
        total:         totalDecimal,
        totalBinario,
      },
      {
        id:            surtidor.id,
        nivelLitros:   nuevoNivelLitros,
        codigoBinario: nuevoCodigoBinario,
        estado:        nuevoEstado,
      }
    );

    // 5. Observer notifica cambio de nivel → genera/resuelve alertas
    const surtidorActualizado = {
      ...surtidor,
      nivelLitros:   nuevoNivelLitros,
      codigoBinario: nuevoCodigoBinario,
    };
    await nivelSubject.notify({
      surtidor: surtidorActualizado,
      ledRojo,
      ledAmarillo,
      porcentaje,
    });

    return NextResponse.json(venta, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
