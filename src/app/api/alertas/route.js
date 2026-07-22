import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const alertas = await prisma.alerta.findMany({
      include: { surtidor: true },
      orderBy: { fecha: 'desc' }
    });
    return NextResponse.json(alertas);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, estado } = body;
    const alerta = await prisma.alerta.update({
      where: { id: Number(id) },
      data: { estado }
    });
    return NextResponse.json(alerta);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
