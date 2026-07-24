/**
 * Patrón Estructural: ADAPTER (Implementación Prisma)
 * ====================================================
 * Implementación concreta del DatabasePort usando Prisma ORM + SQLite.
 * Las rutas API solo conocen el DatabasePort (la abstracción), no Prisma directamente.
 * Si mañana se cambia a Supabase, solo se crea un SupabaseAdapter sin tocar las rutas.
 */

import { DatabasePort } from './DatabaseAdapter.js';
import prisma from '../prisma.js';

export class PrismaAdapter extends DatabasePort {

  // ──────────────────────────── SURTIDORES ────────────────────────────

  async findAllSurtidores() {
    return prisma.surtidor.findMany({
      include: {
        alertas: { where: { estado: 'ACTIVA' } }
      },
      orderBy: { numero: 'asc' }
    });
  }

  async findSurtidorById(id) {
    return prisma.surtidor.findUnique({
      where: { id: Number(id) }
    });
  }

  async createSurtidor(data) {
    return prisma.surtidor.create({ data });
  }

  async updateSurtidor(id, data) {
    return prisma.surtidor.update({
      where: { id: Number(id) },
      data
    });
  }

  async deleteSurtidor(id) {
    return prisma.surtidor.delete({
      where: { id: Number(id) }
    });
  }

  // ──────────────────────────── VENTAS ────────────────────────────

  async findAllVentas() {
    return prisma.venta.findMany({
      include: { surtidor: true },
      orderBy: { fecha: 'desc' }
    });
  }

  async createVenta(data) {
    return prisma.venta.create({ data });
  }

  // ──────────────────────────── ALERTAS ────────────────────────────

  async findAllAlertas() {
    return prisma.alerta.findMany({
      include: { surtidor: true },
      orderBy: { fecha: 'desc' }
    });
  }

  async createAlerta(data) {
    return prisma.alerta.create({ data });
  }

  async updateAlerta(id, data) {
    return prisma.alerta.update({
      where: { id: Number(id) },
      data
    });
  }

  async resolveAlertasBySurtidor(surtidorId) {
    return prisma.alerta.updateMany({
      where: { surtidorId: Number(surtidorId), estado: 'ACTIVA' },
      data: { estado: 'RESUELTA' }
    });
  }

  // ──────────────────────────── TRANSACCIONES ────────────────────────────

  /**
   * Crea una venta y actualiza el surtidor en una transacción atómica.
   * @param {object} ventaData - Datos de la nueva venta
   * @param {{ id: number, nivelLitros: number, codigoBinario: string, estado: string }} surtidorUpdate
   * @returns {[Venta, Surtidor]}
   */
  async registrarVentaConActualizacion(ventaData, surtidorUpdate) {
    return prisma.$transaction([
      prisma.venta.create({ data: ventaData }),
      prisma.surtidor.update({
        where: { id: surtidorUpdate.id },
        data: {
          nivelLitros:   surtidorUpdate.nivelLitros,
          codigoBinario: surtidorUpdate.codigoBinario,
          estado:        surtidorUpdate.estado
        }
      })
    ]);
  }
}

/** Instancia singleton del adapter para usar en las rutas */
export const db = new PrismaAdapter();
