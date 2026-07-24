/**
 * Tests Unitarios: Módulo de Sistemas Digitales (SD)
 * ===================================================
 * Prueba las tres funciones core de lógica digital:
 *   1. calcularBinarioNivel   — Decodificador sensor de nivel
 *   2. evaluarLogicaAlertas   — Mapas de Karnaugh / compuertas lógicas
 *   3. decimalABinario        — Aritmética Binaria
 *
 * Ejecutar: npx vitest run
 */

import { describe, it, expect } from 'vitest';
import {
  calcularBinarioNivel,
  evaluarLogicaAlertas,
  decimalABinario,
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
// 2. evaluarLogicaAlertas — Mapas de Karnaugh / Compuertas Lógicas
// ─────────────────────────────────────────────────────────────────────────────
describe('evaluarLogicaAlertas — Lógica de Karnaugh', () => {
  it('activa LED Rojo (mintérmino m0) con código "00" — compuerta NOR', () => {
    const { ledRojo, ledAmarillo, ledVerde } = evaluarLogicaAlertas('00');
    expect(ledRojo).toBe(true);
    expect(ledAmarillo).toBe(false);
    expect(ledVerde).toBe(false);
  });

  it('activa LED Amarillo (mintérmino m1) con código "01" — AND + NOT', () => {
    const { ledRojo, ledAmarillo, ledVerde } = evaluarLogicaAlertas('01');
    expect(ledRojo).toBe(false);
    expect(ledAmarillo).toBe(true);
    expect(ledVerde).toBe(false);
  });

  it('activa LED Verde (mintérmino m2) con código "10"', () => {
    const { ledRojo, ledAmarillo, ledVerde } = evaluarLogicaAlertas('10');
    expect(ledRojo).toBe(false);
    expect(ledAmarillo).toBe(false);
    expect(ledVerde).toBe(true);
  });

  it('activa LED Verde (mintérmino m3) con código "11"', () => {
    const { ledRojo, ledAmarillo, ledVerde } = evaluarLogicaAlertas('11');
    expect(ledRojo).toBe(false);
    expect(ledAmarillo).toBe(false);
    expect(ledVerde).toBe(true);
  });

  it('incluye expresiones de Karnaugh en los campos de retorno', () => {
    const result = evaluarLogicaAlertas('00');
    expect(result.karnaughRojo).toContain('NOR');
    expect(result.karnaughAmarillo).toContain('AND');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. decimalABinario — Aritmética Binaria (Coma Fija)
// ─────────────────────────────────────────────────────────────────────────────
describe('decimalABinario — Aritmética Binaria', () => {
  it('convierte 0 a "0"', () => {
    expect(decimalABinario(0)).toBe('0');
  });

  it('convierte 1 a "1"', () => {
    expect(decimalABinario(1)).toBe('1');
  });

  it('convierte 10 a "1010"', () => {
    expect(decimalABinario(10)).toBe('1010');
  });

  it('convierte 255 a "11111111"', () => {
    expect(decimalABinario(255)).toBe('11111111');
  });

  it('convierte 372 a "101110100" (precio de venta de Diesel)', () => {
    expect(decimalABinario(372)).toBe('101110100');
  });

  it('convierte 149.6 — resultado contiene punto decimal', () => {
    const result = decimalABinario(149.6);
    expect(result).toContain('.');
    expect(result.startsWith('10010101')).toBe(true); // parte entera de 149
  });

  it('convierte 41.5 — la fracción .5 es ".1" en binario', () => {
    const result = decimalABinario(41.5);
    expect(result).toBe('101001.1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Integración: pipeline completo Nivel → Binario → Karnaugh
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración: Nivel → Código Binario → Lógica Karnaugh', () => {
  it('surtidor al 15% genera alerta CRITICA (m0, LED Rojo)', () => {
    const { code } = calcularBinarioNivel(15);
    const { ledRojo } = evaluarLogicaAlertas(code);
    expect(code).toBe('00');
    expect(ledRojo).toBe(true);
  });

  it('surtidor al 35% genera alerta BAJO (m1, LED Amarillo)', () => {
    const { code } = calcularBinarioNivel(35);
    const { ledAmarillo } = evaluarLogicaAlertas(code);
    expect(code).toBe('01');
    expect(ledAmarillo).toBe(true);
  });

  it('surtidor al 60% no genera alerta (m2, LED Verde)', () => {
    const { code } = calcularBinarioNivel(60);
    const { ledRojo, ledAmarillo, ledVerde } = evaluarLogicaAlertas(code);
    expect(code).toBe('10');
    expect(ledRojo).toBe(false);
    expect(ledAmarillo).toBe(false);
    expect(ledVerde).toBe(true);
  });

  it('surtidor al 85% no genera alerta (m3, LED Verde)', () => {
    const { code } = calcularBinarioNivel(85);
    const { ledRojo, ledAmarillo, ledVerde } = evaluarLogicaAlertas(code);
    expect(code).toBe('11');
    expect(ledRojo).toBe(false);
    expect(ledAmarillo).toBe(false);
    expect(ledVerde).toBe(true);
  });
});
