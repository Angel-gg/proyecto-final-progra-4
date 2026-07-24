/**
 * Tests Unitarios: Módulo de Sistemas Digitales (SD) — v2
 * ========================================================
 * Cubre las nuevas funciones: compuertas NAND/NOR/XNOR,
 * decodificarCombustible, y la integración completa del circuito.
 *
 * Ejecutar: npx vitest run
 */

import { describe, it, expect } from 'vitest';
import {
  calcularBinarioNivel,
  evaluarLogicaAlertas,
  decimalABinario,
  decodificarCombustible,
  NAND, NOR, AND, OR, NOT, XNOR,
} from '../src/lib/digitalSystems.js';

// ─────────────────────────────────────────────────────────────────────────────
// 1. calcularBinarioNivel — Decodificador de Sensor de Nivel (2 bits)
// ─────────────────────────────────────────────────────────────────────────────
describe('calcularBinarioNivel — Decodificador de Sensor', () => {
  it('devuelve "00" (Crítico) cuando el porcentaje es 0%', () => {
    const result = calcularBinarioNivel(0);
    expect(result.code).toBe('00');
    expect(result.status).toBe('Rojo');
  });

  it('devuelve "00" (Crítico) cuando el porcentaje es 24.9%', () => {
    const result = calcularBinarioNivel(24.9);
    expect(result.code).toBe('00');
    expect(result.status).toBe('Rojo');
  });

  it('devuelve "01" (Bajo) cuando el porcentaje es exactamente 25%', () => {
    const result = calcularBinarioNivel(25);
    expect(result.code).toBe('01');
    expect(result.status).toBe('Amarillo');
  });

  it('devuelve "01" (Bajo) cuando el porcentaje es 49.9%', () => {
    const result = calcularBinarioNivel(49.9);
    expect(result.code).toBe('01');
    expect(result.status).toBe('Amarillo');
  });

  it('devuelve "10" (Medio) cuando el porcentaje es exactamente 50%', () => {
    const result = calcularBinarioNivel(50);
    expect(result.code).toBe('10');
    expect(result.status).toBe('Verde');
  });

  it('devuelve "10" (Medio) cuando el porcentaje es 74.9%', () => {
    const result = calcularBinarioNivel(74.9);
    expect(result.code).toBe('10');
    expect(result.status).toBe('Verde');
  });

  it('devuelve "11" (Lleno) cuando el porcentaje es exactamente 75%', () => {
    const result = calcularBinarioNivel(75);
    expect(result.code).toBe('11');
    expect(result.status).toBe('Verde');
  });

  it('devuelve "11" (Lleno) cuando el porcentaje es 100%', () => {
    const result = calcularBinarioNivel(100);
    expect(result.code).toBe('11');
    expect(result.status).toBe('Verde');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Compuertas Lógicas Básicas (NAND, NOR, AND, OR, NOT, XNOR)
// ─────────────────────────────────────────────────────────────────────────────
describe('Compuertas Lógicas — Tabla de Verdad completa', () => {
  // NAND
  it('NAND(0,0) = 1', () => expect(NAND(false, false)).toBe(true));
  it('NAND(0,1) = 1', () => expect(NAND(false, true)).toBe(true));
  it('NAND(1,0) = 1', () => expect(NAND(true, false)).toBe(true));
  it('NAND(1,1) = 0', () => expect(NAND(true, true)).toBe(false));

  // NOR
  it('NOR(0,0) = 1', () => expect(NOR(false, false)).toBe(true));
  it('NOR(0,1) = 0', () => expect(NOR(false, true)).toBe(false));
  it('NOR(1,0) = 0', () => expect(NOR(true, false)).toBe(false));
  it('NOR(1,1) = 0', () => expect(NOR(true, true)).toBe(false));

  // NAND como inversor universal: NAND(x,x) = NOT(x)
  it('NAND(0,0) como NOT(0) = 1', () => expect(NAND(false, false)).toBe(NOT(false)));
  it('NAND(1,1) como NOT(1) = 0', () => expect(NAND(true, true)).toBe(NOT(true)));

  // XNOR
  it('XNOR(0,0) = 1 (iguales)', () => expect(XNOR(false, false)).toBe(true));
  it('XNOR(1,1) = 1 (iguales)', () => expect(XNOR(true, true)).toBe(true));
  it('XNOR(0,1) = 0 (diferentes)', () => expect(XNOR(false, true)).toBe(false));

  // Propiedad: NAND universal puede implementar cualquier compuerta
  it('NOT usando NAND: NOT(A) = NAND(A,A)', () => {
    expect(NAND(true, true)).toBe(NOT(true));
    expect(NAND(false, false)).toBe(NOT(false));
  });

  it('AND usando NAND: AND(A,B) = NOT(NAND(A,B))', () => {
    expect(AND(true, true)).toBe(NOT(NAND(true, true)));
    expect(AND(true, false)).toBe(NOT(NAND(true, false)));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. evaluarLogicaAlertas — Mapas de Karnaugh / Compuertas Lógicas
// ─────────────────────────────────────────────────────────────────────────────
describe('evaluarLogicaAlertas — Lógica de Karnaugh + NAND Universal', () => {
  it('activa LED Rojo (m0) con "00" — usa NAND como inversor + AND', () => {
    const { ledRojo, ledAmarillo, ledVerde } = evaluarLogicaAlertas('00');
    expect(ledRojo).toBe(true);
    expect(ledAmarillo).toBe(false);
    expect(ledVerde).toBe(false);
  });

  it('activa LED Amarillo (m1) con "01" — AND + NOT', () => {
    const { ledRojo, ledAmarillo, ledVerde } = evaluarLogicaAlertas('01');
    expect(ledRojo).toBe(false);
    expect(ledAmarillo).toBe(true);
    expect(ledVerde).toBe(false);
  });

  it('activa LED Verde (m2) con "10"', () => {
    const { ledRojo, ledAmarillo, ledVerde } = evaluarLogicaAlertas('10');
    expect(ledRojo).toBe(false);
    expect(ledAmarillo).toBe(false);
    expect(ledVerde).toBe(true);
  });

  it('activa LED Verde (m3) con "11"', () => {
    const { ledRojo, ledAmarillo, ledVerde } = evaluarLogicaAlertas('11');
    expect(ledRojo).toBe(false);
    expect(ledAmarillo).toBe(false);
    expect(ledVerde).toBe(true);
  });

  it('devuelve compuertas intermedias NAND en el resultado', () => {
    const result = evaluarLogicaAlertas('00');
    expect(result.compuertas).toBeDefined();
    expect(result.compuertas.notS1_nand).toContain('NAND');
    expect(result.compuertas.notS0_nand).toContain('NAND');
  });

  it('la implementación NAND del LED Rojo es consistente con NOR directa', () => {
    // LED Rojo = NAND(NAND(S1,S1), NAND(S0,S0)) debe ser igual a NOR(S1,S0)
    for (const code of ['00', '01', '10', '11']) {
      const s1 = code[0] === '1';
      const s0 = code[1] === '1';
      const { ledRojo, compuertas } = evaluarLogicaAlertas(code);
      expect(ledRojo).toBe(compuertas.nor_gate); // Verificación cruzada
    }
  });

  it('incluye expresión K-Map con NAND en karnaughRojo', () => {
    const result = evaluarLogicaAlertas('00');
    expect(result.karnaughRojo).toContain('NAND');
    expect(result.karnaughRojo).toContain('NOR');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. decimalABinario — Aritmética Binaria (Coma Fija)
// ─────────────────────────────────────────────────────────────────────────────
describe('decimalABinario — Aritmética Binaria', () => {
  it('convierte 0 a "0"', () => expect(decimalABinario(0)).toBe('0'));
  it('convierte 1 a "1"', () => expect(decimalABinario(1)).toBe('1'));
  it('convierte 10 a "1010"', () => expect(decimalABinario(10)).toBe('1010'));
  it('convierte 255 a "11111111"', () => expect(decimalABinario(255)).toBe('11111111'));
  it('convierte 372 a "101110100"', () => expect(decimalABinario(372)).toBe('101110100'));
  it('convierte 149.6 con punto decimal', () => {
    const result = decimalABinario(149.6);
    expect(result).toContain('.');
    expect(result.startsWith('10010101')).toBe(true);
  });
  it('convierte 41.5 → "101001.1"', () => expect(decimalABinario(41.5)).toBe('101001.1'));
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. decodificarCombustible — Decodificador de 2 bits
// ─────────────────────────────────────────────────────────────────────────────
describe('decodificarCombustible — Decodificador 2 bits', () => {
  it('código "00" → Gasolina Especial a Bs 3.74', () => {
    const r = decodificarCombustible('00');
    expect(r.nombre).toContain('Gasolina Especial');
    expect(r.precio).toBe(3.74);
  });

  it('código "01" → Diesel Oil a Bs 3.72', () => {
    const r = decodificarCombustible('01');
    expect(r.nombre).toContain('Diesel Oil');
    expect(r.precio).toBe(3.72);
  });

  it('código "10" → Gasolina Premium a Bs 4.79', () => {
    const r = decodificarCombustible('10');
    expect(r.nombre).toContain('Premium');
    expect(r.precio).toBe(4.79);
  });

  it('código "11" → GNV a Bs 1.66', () => {
    const r = decodificarCombustible('11');
    expect(r.nombre).toContain('GNV');
    expect(r.precio).toBe(1.66);
  });

  it('código desconocido → Desconocido con precio 0', () => {
    const r = decodificarCombustible('XX');
    expect(r.nombre).toBe('Desconocido');
    expect(r.precio).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Integración: pipeline completo Nivel → Binario → Karnaugh → LED
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración: Nivel → Código Binario → Karnaugh → LED', () => {
  it('surtidor al 15% → m0, LED Rojo via NAND universal', () => {
    const { code } = calcularBinarioNivel(15);
    const { ledRojo, compuertas } = evaluarLogicaAlertas(code);
    expect(code).toBe('00');
    expect(ledRojo).toBe(true);
    expect(compuertas.nor_gate).toBe(true); // NOR verifica NAND
  });

  it('surtidor al 35% → m1, LED Amarillo', () => {
    const { code } = calcularBinarioNivel(35);
    const { ledAmarillo } = evaluarLogicaAlertas(code);
    expect(code).toBe('01');
    expect(ledAmarillo).toBe(true);
  });

  it('surtidor al 60% → m2, LED Verde', () => {
    const { code } = calcularBinarioNivel(60);
    const { ledRojo, ledAmarillo, ledVerde } = evaluarLogicaAlertas(code);
    expect(code).toBe('10');
    expect(ledVerde).toBe(true);
    expect(ledRojo).toBe(false);
    expect(ledAmarillo).toBe(false);
  });

  it('surtidor al 85% → m3, LED Verde', () => {
    const { code } = calcularBinarioNivel(85);
    const { ledVerde } = evaluarLogicaAlertas(code);
    expect(code).toBe('11');
    expect(ledVerde).toBe(true);
  });

  it('todos los códigos válidos tienen exactamente un LED activo', () => {
    for (const code of ['00', '01', '10', '11']) {
      const { ledRojo, ledAmarillo, ledVerde } = evaluarLogicaAlertas(code);
      const activos = [ledRojo, ledAmarillo, ledVerde].filter(Boolean).length;
      expect(activos).toBe(1);
    }
  });
});
