/**
 * Patrón Creacional: FACTORY para Surtidores
 * ===========================================
 * Centraliza la construcción de objetos Surtidor con validaciones,
 * valores por defecto y cálculos de sistemas digitales según el tipo de combustible.
 *
 * Uso:
 *   const data = SurtidorFactory.crear({ numero, combustible, capacidad, nivelLitros });
 *   const surtidor = await db.createSurtidor(data);
 */

import { calcularBinarioNivel, evaluarLogicaAlertas } from '../digitalSystems.js';

// ─── Configuración de cada tipo de combustible ───
const COMBUSTIBLE_CONFIG = {
  'Gasolina Especial': {
    etiqueta:       'Gasolina Especial (Bs 3.74/L)',
    precioPorLitro: 3.74,
    capacidadMax:   15000,
  },
  'Diesel Oil': {
    etiqueta:       'Diesel Oil (Bs 3.72/L)',
    precioPorLitro: 3.72,
    capacidadMax:   20000,
  },
  'Gasolina Premium Ultra': {
    etiqueta:       'Gasolina Premium Ultra (Bs 4.79/L)',
    precioPorLitro: 4.79,
    capacidadMax:   10000,
  },
  'GNV Vehicular': {
    etiqueta:       'GNV Vehicular (Bs 1.66/m3)',
    precioPorLitro: 1.66,
    capacidadMax:   25000,
  },
};

export class SurtidorFactory {
  /**
   * Construye el objeto de datos para crear/actualizar un Surtidor.
   * Aplica validaciones, cálculos binarios (SD) y determina el estado.
   *
   * @param {{ numero: number|string, combustible: string, capacidad: number|string, nivelLitros: number|string }} params
   * @returns {{ numero: number, combustible: string, capacidad: number, nivelLitros: number, codigoBinario: string, estado: string }}
   * @throws {Error} Si los datos son inválidos
   */
  static crear({ numero, combustible, capacidad, nivelLitros }) {
    const num   = Number(numero);
    const cap   = Number(capacidad);
    const nivel = Number(nivelLitros);

    // ── Validaciones ──
    if (!Number.isInteger(num) || num <= 0) {
      throw new Error('El número de surtidor debe ser un entero positivo.');
    }
    if (cap <= 0) {
      throw new Error('La capacidad debe ser mayor a 0 litros.');
    }
    if (nivel < 0 || nivel > cap) {
      throw new Error(`El nivel (${nivel}L) no puede ser negativo ni superar la capacidad (${cap}L).`);
    }

    // Combustible normalizado (se acepta la clave base o la etiqueta completa)
    const claveBase = Object.keys(COMBUSTIBLE_CONFIG).find(k =>
      combustible.toLowerCase().includes(k.toLowerCase())
    );
    if (!claveBase) {
      throw new Error(`Tipo de combustible desconocido: "${combustible}".`);
    }
    const config = COMBUSTIBLE_CONFIG[claveBase];

    // ── Cálculos de Sistemas Digitales ──
    const porcentaje = (nivel / cap) * 100;
    const { code: codigoBinario }       = calcularBinarioNivel(porcentaje);
    const { ledRojo, ledAmarillo }      = evaluarLogicaAlertas(codigoBinario);

    const estado = (ledRojo || ledAmarillo) ? 'ALERTA' : 'OPERATIVO';

    return {
      numero:       num,
      combustible:  config.etiqueta,
      capacidad:    cap,
      nivelLitros:  nivel,
      codigoBinario,
      estado,
    };
  }

  /**
   * Devuelve el precio por litro asociado a un tipo de combustible.
   * @param {string} combustible
   * @returns {number}
   */
  static getPrecioPorLitro(combustible) {
    const claveBase = Object.keys(COMBUSTIBLE_CONFIG).find(k =>
      combustible.toLowerCase().includes(k.toLowerCase())
    );
    return claveBase ? COMBUSTIBLE_CONFIG[claveBase].precioPorLitro : null;
  }

  /**
   * Lista los tipos de combustible disponibles.
   * @returns {string[]}
   */
  static getTiposDeCombustible() {
    return Object.keys(COMBUSTIBLE_CONFIG);
  }
}
