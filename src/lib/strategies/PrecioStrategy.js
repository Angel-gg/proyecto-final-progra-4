/**
 * Patrón de Comportamiento: STRATEGY para Cálculo de Precios
 * ===========================================================
 * Encapsula el algoritmo de precio por tipo de combustible.
 * Permite cambiar la estrategia de precios sin modificar la lógica de ventas.
 *
 * Estrategias disponibles:
 *  - GasolinaEspecialStrategy  (Bs 3.74/L)
 *  - DieselStrategy            (Bs 3.72/L)
 *  - PremiumStrategy           (Bs 4.79/L)
 *  - GNVStrategy               (Bs 1.66/m³)
 *
 * Uso:
 *   const strategy = PrecioContext.getStrategy('Gasolina Especial');
 *   const total = strategy.calcularTotal(litros);
 */

// ─── Interfaz base (Strategy Interface) ───
export class PrecioStrategy {
  /** @param {number} litros */
  calcularTotal(litros) { throw new Error('Not implemented'); }
  getPrecioPorLitro()   { throw new Error('Not implemented'); }
  getNombreCombustible(){ throw new Error('Not implemented'); }
  getCodigoBinario()    { throw new Error('Not implemented'); }
}

// ─── Estrategias Concretas ───────────────────────────────────────

export class GasolinaEspecialStrategy extends PrecioStrategy {
  calcularTotal(litros)     { return Number(litros) * 3.74; }
  getPrecioPorLitro()       { return 3.74; }
  getNombreCombustible()    { return 'Gasolina Especial (Bs 3.74/L)'; }
  getCodigoBinario()        { return '00'; } // Decodificador 2 bits
}

export class DieselStrategy extends PrecioStrategy {
  calcularTotal(litros)     { return Number(litros) * 3.72; }
  getPrecioPorLitro()       { return 3.72; }
  getNombreCombustible()    { return 'Diesel Oil (Bs 3.72/L)'; }
  getCodigoBinario()        { return '01'; }
}

export class PremiumStrategy extends PrecioStrategy {
  calcularTotal(litros)     { return Number(litros) * 4.79; }
  getPrecioPorLitro()       { return 4.79; }
  getNombreCombustible()    { return 'Gasolina Premium Ultra (Bs 4.79/L)'; }
  getCodigoBinario()        { return '10'; }
}

export class GNVStrategy extends PrecioStrategy {
  calcularTotal(litros)     { return Number(litros) * 1.66; }
  getPrecioPorLitro()       { return 1.66; }
  getNombreCombustible()    { return 'GNV Vehicular (Bs 1.66/m3)'; }
  getCodigoBinario()        { return '11'; }
}

// ─── Contexto (PrecioContext) ─────────────────────────────────────
/**
 * Contexto que selecciona y ejecuta la estrategia de precio correcta
 * según el tipo de combustible detectado.
 */
export class PrecioContext {
  static #strategies = [
    new GasolinaEspecialStrategy(),
    new DieselStrategy(),
    new PremiumStrategy(),
    new GNVStrategy(),
  ];

  /**
   * Obtiene la estrategia correspondiente al combustible dado.
   * @param {string} combustible - Nombre del combustible (acepta parcial)
   * @returns {PrecioStrategy}
   */
  static getStrategy(combustible) {
    const lower = combustible.toLowerCase();
    if (lower.includes('premium'))  return new PremiumStrategy();
    if (lower.includes('diesel'))   return new DieselStrategy();
    if (lower.includes('gnv'))      return new GNVStrategy();
    return new GasolinaEspecialStrategy(); // default
  }

  /** Lista todas las estrategias disponibles */
  static getAllStrategies() {
    return this.#strategies;
  }
}
