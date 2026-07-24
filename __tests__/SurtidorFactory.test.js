/**
 * Tests Unitarios: SurtidorFactory (Patrón Creacional)
 * =====================================================
 * Verifica que la Factory construye correctamente objetos Surtidor,
 * aplica validaciones y calcula códigos binarios SD.
 *
 * Ejecutar: npx vitest run
 */

import { describe, it, expect } from 'vitest';
import { SurtidorFactory } from '../src/lib/factories/SurtidorFactory.js';

describe('SurtidorFactory.crear — Patrón Factory', () => {

  // ─── Casos válidos ───
  it('crea un surtidor de Gasolina Especial correctamente', () => {
    const data = SurtidorFactory.crear({
      numero: 1,
      combustible: 'Gasolina Especial',
      capacidad: 10000,
      nivelLitros: 8500,
    });
    expect(data.numero).toBe(1);
    expect(data.combustible).toContain('Gasolina Especial');
    expect(data.codigoBinario).toBe('11'); // 85% → lleno
    expect(data.estado).toBe('OPERATIVO');
  });

  it('asigna estado ALERTA cuando el nivel es crítico (<25%)', () => {
    const data = SurtidorFactory.crear({
      numero: 3,
      combustible: 'Gasolina Premium Ultra',
      capacidad: 8000,
      nivelLitros: 1200, // 15%
    });
    expect(data.codigoBinario).toBe('00');
    expect(data.estado).toBe('ALERTA');
  });

  it('asigna estado ALERTA cuando el nivel es bajo (25%-50%)', () => {
    const data = SurtidorFactory.crear({
      numero: 2,
      combustible: 'Diesel Oil',
      capacidad: 12000,
      nivelLitros: 4200, // 35%
    });
    expect(data.codigoBinario).toBe('01');
    expect(data.estado).toBe('ALERTA');
  });

  it('acepta la etiqueta completa del combustible', () => {
    const data = SurtidorFactory.crear({
      numero: 4,
      combustible: 'GNV Vehicular (Bs 1.66/m3)',
      capacidad: 15000,
      nivelLitros: 11000,
    });
    expect(data.combustible).toContain('GNV Vehicular');
  });

  it('acepta strings numéricos como número y capacidad', () => {
    const data = SurtidorFactory.crear({
      numero: '5',
      combustible: 'Diesel Oil',
      capacidad: '10000',
      nivelLitros: '7000',
    });
    expect(typeof data.numero).toBe('number');
    expect(typeof data.capacidad).toBe('number');
  });

  // ─── Validaciones ───
  it('lanza error si el número es 0 o negativo', () => {
    expect(() => SurtidorFactory.crear({
      numero: 0, combustible: 'Gasolina Especial', capacidad: 10000, nivelLitros: 5000,
    })).toThrow('entero positivo');
  });

  it('lanza error si la capacidad es 0', () => {
    expect(() => SurtidorFactory.crear({
      numero: 1, combustible: 'Diesel Oil', capacidad: 0, nivelLitros: 0,
    })).toThrow('mayor a 0');
  });

  it('lanza error si el nivel supera la capacidad', () => {
    expect(() => SurtidorFactory.crear({
      numero: 1, combustible: 'Gasolina Especial', capacidad: 5000, nivelLitros: 6000,
    })).toThrow('superar la capacidad');
  });

  it('lanza error si el combustible es desconocido', () => {
    expect(() => SurtidorFactory.crear({
      numero: 1, combustible: 'Keroseno', capacidad: 5000, nivelLitros: 2000,
    })).toThrow('desconocido');
  });

  // ─── Métodos auxiliares ───
  it('getTiposDeCombustible devuelve los 4 tipos', () => {
    const tipos = SurtidorFactory.getTiposDeCombustible();
    expect(tipos).toHaveLength(4);
    expect(tipos).toContain('Gasolina Especial');
    expect(tipos).toContain('Diesel Oil');
    expect(tipos).toContain('Gasolina Premium Ultra');
    expect(tipos).toContain('GNV Vehicular');
  });

  it('getPrecioPorLitro retorna el precio correcto para Diesel Oil', () => {
    const precio = SurtidorFactory.getPrecioPorLitro('Diesel Oil');
    expect(precio).toBe(3.72);
  });

  it('getPrecioPorLitro retorna null para combustible desconocido', () => {
    const precio = SurtidorFactory.getPrecioPorLitro('Gasolina Marciana');
    expect(precio).toBeNull();
  });
});
