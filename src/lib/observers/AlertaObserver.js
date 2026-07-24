/**
 * Patrón de Comportamiento: OBSERVER para el Sistema de Alertas
 * ==============================================================
 * El Subject (NivelSurtidorSubject) notifica a todos sus observers cuando
 * el nivel de un surtidor cambia. Los Observers reaccionan de forma
 * independiente: uno persiste la alerta en BD, otro podría enviar emails, etc.
 *
 * Diagrama:
 *   NivelSurtidorSubject ──notifica──► AlertaPersistenciaObserver
 *                         ──notifica──► LogObserver
 */

// ─── Interfaz base Observer ───
export class AlertaObserver {
  /**
   * @param {{ surtidor: object, ledRojo: boolean, ledAmarillo: boolean, porcentaje: number }} estado
   */
  async update(estado) {
    throw new Error('Not implemented: update(estado)');
  }
}

// ─── Subject (publicador de eventos de nivel) ───
export class NivelSurtidorSubject {
  constructor() {
    this._observers = [];
  }

  /** Registra un observer */
  subscribe(observer) {
    if (!(observer instanceof AlertaObserver)) {
      throw new TypeError('El observer debe extender AlertaObserver');
    }
    this._observers.push(observer);
  }

  /** Elimina un observer */
  unsubscribe(observer) {
    this._observers = this._observers.filter(o => o !== observer);
  }

  /**
   * Notifica a todos los observers con el estado actual del surtidor.
   * @param {{ surtidor: object, ledRojo: boolean, ledAmarillo: boolean, porcentaje: number }} estado
   */
  async notify(estado) {
    const promises = this._observers.map(o => o.update(estado));
    await Promise.all(promises);
  }
}

// ─── Observer Concreto 1: Persiste alertas en BD via Adapter ───
export class AlertaPersistenciaObserver extends AlertaObserver {
  /**
   * @param {import('../adapters/PrismaAdapter').PrismaAdapter} dbAdapter
   */
  constructor(dbAdapter) {
    super();
    this.db = dbAdapter;
  }

  async update({ surtidor, ledRojo, ledAmarillo, porcentaje }) {
    // Si el nivel es normal: resolver alertas anteriores
    if (!ledRojo && !ledAmarillo) {
      await this.db.resolveAlertasBySurtidor(surtidor.id);
      return;
    }

    // Crear alerta según el tipo detectado por Karnaugh
    if (ledRojo) {
      await this.db.createAlerta({
        surtidorId: surtidor.id,
        tipo: 'CRITICO',
        mensaje: `Surtidor #${surtidor.numero}: Nivel Crítico en ${porcentaje.toFixed(1)}% (LED Rojo — Compuerta NOR / Karnaugh Mintermino m0)`,
        logicaKarnaugh: "F(S1,S0) = (S1 + S0)' => [00]",
      });
    } else if (ledAmarillo) {
      await this.db.createAlerta({
        surtidorId: surtidor.id,
        tipo: 'BAJO',
        mensaje: `Surtidor #${surtidor.numero}: Nivel Bajo en ${porcentaje.toFixed(1)}% (LED Amarillo — Compuerta AND/NOT / Karnaugh Mintermino m1)`,
        logicaKarnaugh: "F(S1,S0) = S1' · S0 => [01]",
      });
    }
  }
}

// ─── Observer Concreto 2: Log de consola (útil para depuración) ───
export class LogObserver extends AlertaObserver {
  async update({ surtidor, ledRojo, ledAmarillo, porcentaje }) {
    const timestamp = new Date().toISOString();
    if (ledRojo) {
      console.warn(`[${timestamp}] 🔴 ALERTA CRÍTICA — Surtidor #${surtidor.numero} al ${porcentaje.toFixed(1)}%`);
    } else if (ledAmarillo) {
      console.warn(`[${timestamp}] 🟡 NIVEL BAJO — Surtidor #${surtidor.numero} al ${porcentaje.toFixed(1)}%`);
    } else {
      console.info(`[${timestamp}] 🟢 OPERATIVO — Surtidor #${surtidor.numero} al ${porcentaje.toFixed(1)}%`);
    }
  }
}
