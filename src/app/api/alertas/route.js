/**
 * API Route: /api/alertas
 * Refactorizada para usar PrismaAdapter (Patrón Adapter)
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/adapters/PrismaAdapter';

// ─── GET /api/alertas ─────────────────────────────────────────────
export async function GET() {
  try {
    const alertas = await db.findAllAlertas();
    return NextResponse.json(alertas);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── PUT /api/alertas (ej. marcar como RESUELTA) ──────────────────
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, estado } = body;

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const alerta = await db.updateAlerta(id, { estado });
    return NextResponse.json(alerta);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
