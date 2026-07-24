/**
 * API Route: /api/ventas
 * Refactorizada para usar:
 *   - PrismaAdapter   (Patrón Estructural/Adapter) — transacción atómica
 *   - NivelSurtidorSubject + AlertaPersistenciaObserver (Patrón Observer)
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

// ─── Sistema Observer (mismo patrón que en surtidores) ───
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

    // 2. Cálculos de Sistemas Digitales — Aritmética Binaria
    const totalDecimal     = litrosNum * Number(precioPorLitro);
    const totalBinario     = decimalABinario(totalDecimal);
    const nuevoNivelLitros = surtidor.nivelLitros - litrosNum;
    const porcentaje       = (nuevoNivelLitros / surtidor.capacidad) * 100;
    const { code: nuevoCodigoBinario } = calcularBinarioNivel(porcentaje);
    const { ledRojo, ledAmarillo }     = evaluarLogicaAlertas(nuevoCodigoBinario);
    const nuevoEstado = (ledRojo || ledAmarillo) ? 'ALERTA' : 'OPERATIVO';

    // 3. Transacción atómica via Adapter (venta + actualización de surtidor)
    const [venta] = await db.registrarVentaConActualizacion(
      {
        surtidorId:    surtidor.id,
        combustible:   surtidor.combustible,
        litros:        litrosNum,
        precioPorLitro: Number(precioPorLitro),
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

    // 4. Observer notifica sobre el nuevo nivel tras la venta
    const surtidorActualizado = { ...surtidor, nivelLitros: nuevoNivelLitros, codigoBinario: nuevoCodigoBinario };
    await nivelSubject.notify({ surtidor: surtidorActualizado, ledRojo, ledAmarillo, porcentaje });

    return NextResponse.json(venta, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
