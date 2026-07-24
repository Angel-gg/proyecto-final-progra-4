/**
 * Patrón Estructural: ADAPTER para Base de Datos
 * ================================================
 * Define la interfaz (contrato) que cualquier adaptador de BD debe cumplir.
 * Permite cambiar de Prisma/SQLite a Supabase/PostgreSQL sin modificar las rutas API.
 */

export class DatabasePort {
  // ── Surtidores ──
  async findAllSurtidores()               { throw new Error('Not implemented'); }
  async findSurtidorById(id)              { throw new Error('Not implemented'); }
  async createSurtidor(data)              { throw new Error('Not implemented'); }
  async updateSurtidor(id, data)          { throw new Error('Not implemented'); }
  async deleteSurtidor(id)               { throw new Error('Not implemented'); }

  // ── Ventas ──
  async findAllVentas()                  { throw new Error('Not implemented'); }
  async createVenta(data)                { throw new Error('Not implemented'); }

  // ── Alertas ──
  async findAllAlertas()                 { throw new Error('Not implemented'); }
  async createAlerta(data)               { throw new Error('Not implemented'); }
  async updateAlerta(id, data)           { throw new Error('Not implemented'); }
  async resolveAlertasBySurtidor(surtidorId) { throw new Error('Not implemented'); }

  // ── Transacciones atómicas ──
  async registrarVentaConActualizacion(ventaData, surtidorUpdate) {
    throw new Error('Not implemented');
  }
}
