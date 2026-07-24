/**
 * Tests Unitarios: Patrón Strategy — PrecioContext
 * =================================================
 * Verifica que cada estrategia de precio calcula correctamente
 * y que el contexto selecciona la estrategia adecuada.
 *
 * Ejecutar: npx vitest run
 */

import { describe, it, expect } from 'vitest';
import {
  GasolinaEspecialStrategy,
  DieselStrategy,
  PremiumStrategy,
  GNVStrategy,
  PrecioContext,
} from '../src/lib/strategies/PrecioStrategy.js';

describe('Estrategias de Precio (Patrón Strategy)', () => {

  describe('GasolinaEspecialStrategy', () => {
    const s = new GasolinaEspecialStrategy();
    it('precio unitario = 3.74', () => expect(s.getPrecioPorLitro()).toBe(3.74));
    it('calcularTotal(40) = 149.6', () => expect(s.calcularTotal(40)).toBeCloseTo(149.6, 2));
    it('código binario = "00"', () => expect(s.getCodigoBinario()).toBe('00'));
    it('nombre incluye Gasolina Especial', () => expect(s.getNombreCombustible()).toContain('Gasolina Especial'));
  });

  describe('DieselStrategy', () => {
    const s = new DieselStrategy();
    it('precio unitario = 3.72', () => expect(s.getPrecioPorLitro()).toBe(3.72));
    it('calcularTotal(100) = 372', () => expect(s.calcularTotal(100)).toBeCloseTo(372, 2));
    it('código binario = "01"', () => expect(s.getCodigoBinario()).toBe('01'));
  });

  describe('PremiumStrategy', () => {
    const s = new PremiumStrategy();
    it('precio unitario = 4.79', () => expect(s.getPrecioPorLitro()).toBe(4.79));
    it('calcularTotal(50) = 239.5', () => expect(s.calcularTotal(50)).toBeCloseTo(239.5, 2));
    it('código binario = "10"', () => expect(s.getCodigoBinario()).toBe('10'));
  });

  describe('GNVStrategy', () => {
    const s = new GNVStrategy();
    it('precio unitario = 1.66', () => expect(s.getPrecioPorLitro()).toBe(1.66));
    it('calcularTotal(25) = 41.5', () => expect(s.calcularTotal(25)).toBeCloseTo(41.5, 2));
    it('código binario = "11"', () => expect(s.getCodigoBinario()).toBe('11'));
  });

  describe('PrecioContext — selección de estrategia', () => {
    it('selecciona GasolinaEspecial como default', () => {
      const s = PrecioContext.getStrategy('Gasolina Especial');
      expect(s.getPrecioPorLitro()).toBe(3.74);
    });

    it('selecciona Diesel por nombre parcial', () => {
      const s = PrecioContext.getStrategy('Diesel Oil (Bs 3.72/L)');
      expect(s.getPrecioPorLitro()).toBe(3.72);
    });

    it('selecciona Premium por nombre parcial', () => {
      const s = PrecioContext.getStrategy('Gasolina Premium Ultra (Bs 4.79/L)');
      expect(s.getPrecioPorLitro()).toBe(4.79);
    });

    it('selecciona GNV por nombre parcial', () => {
      const s = PrecioContext.getStrategy('GNV Vehicular (Bs 1.66/m3)');
      expect(s.getPrecioPorLitro()).toBe(1.66);
    });

    it('getAllStrategies devuelve exactamente 4 estrategias', () => {
      const all = PrecioContext.getAllStrategies();
      expect(all).toHaveLength(4);
    });

    it('los precios de cada estrategia son distintos', () => {
      const precios = PrecioContext.getAllStrategies().map(s => s.getPrecioPorLitro());
      const unicos = new Set(precios);
      expect(unicos.size).toBe(4);
    });

    it('los códigos binarios cubren los 4 minterminos (00,01,10,11)', () => {
      const codigos = PrecioContext.getAllStrategies().map(s => s.getCodigoBinario()).sort();
      expect(codigos).toEqual(['00', '01', '10', '11']);
    });
  });
});
