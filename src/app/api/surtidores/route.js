/**
 * API Route: /api/surtidores
 * Refactorizada para usar:
 *   - SurtidorFactory (Patrón Creacional)
 *   - PrismaAdapter   (Patrón Estructural/Adapter)
 *   - NivelSurtidorSubject + AlertaPersistenciaObserver (Patrón Observer)
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/adapters/PrismaAdapter';
import { SurtidorFactory } from '@/lib/factories/SurtidorFactory';
import {
  NivelSurtidorSubject,
  AlertaPersistenciaObserver,
  LogObserver,
} from '@/lib/observers/AlertaObserver';
import { evaluarLogicaAlertas } from '@/lib/digitalSystems';

// ─── Configurar el sistema Observer una sola vez ───
const nivelSubject = new NivelSurtidorSubject();
nivelSubject.subscribe(new AlertaPersistenciaObserver(db));
nivelSubject.subscribe(new LogObserver());

// ─── GET /api/surtidores ───────────────────────────────────────────
export async function GET() {
  try {
    const surtidores = await db.findAllSurtidores();
    return NextResponse.json(surtidores);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── POST /api/surtidores ─────────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json();

    // Factory construye y valida el objeto Surtidor
    const data = SurtidorFactory.crear(body);
    const surtidor = await db.createSurtidor(data);

    // Observer notifica sobre el nivel inicial
    const porcentaje = (surtidor.nivelLitros / surtidor.capacidad) * 100;
    const { ledRojo, ledAmarillo } = evaluarLogicaAlertas(surtidor.codigoBinario);
    await nivelSubject.notify({ surtidor, ledRojo, ledAmarillo, porcentaje });

    return NextResponse.json(surtidor, { status: 201 });
  } catch (error) {
    const status = error.message.includes('desconocido') ||
                   error.message.includes('debe') ||
                   error.message.includes('puede') ? 400 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

// ─── PUT /api/surtidores ──────────────────────────────────────────
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    // Factory valida y calcula los nuevos valores
    const data = SurtidorFactory.crear(rest);
    const surtidor = await db.updateSurtidor(id, data);

    // Observer evalúa si se deben crear/resolver alertas
    const porcentaje = (surtidor.nivelLitros / surtidor.capacidad) * 100;
    const { ledRojo, ledAmarillo } = evaluarLogicaAlertas(surtidor.codigoBinario);
    await nivelSubject.notify({ surtidor, ledRojo, ledAmarillo, porcentaje });

    return NextResponse.json(surtidor);
  } catch (error) {
    const status = error.message.includes('desconocido') ||
                   error.message.includes('debe') ||
                   error.message.includes('puede') ? 400 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

// ─── DELETE /api/surtidores?id=X ─────────────────────────────────
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await db.deleteSurtidor(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
