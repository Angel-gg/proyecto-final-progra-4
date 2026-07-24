/**
 * Módulo de Lógica Digital y Sistemas Digitales (SD)
 * ====================================================
 * Circuito de Monitoreo de Nivel para "El Surtidor Cochabambino"
 *
 * Entradas: S1, S0 (sensor de nivel 2 bits)
 * Salidas:  LED Rojo (Crítico), LED Amarillo (Bajo), LED Verde (Normal)
 *
 * Tabla de Verdad:
 * ┌────┬────┬──────────┬────────────┬───────────────────────────────┐
 * │ S1 │ S0 │ Rango    │ LED        │ Expresión K-Map               │
 * ├────┼────┼──────────┼────────────┼───────────────────────────────┤
 * │  0 │  0 │ 0-25%    │ 🔴 Rojo   │ F = (S1 NAND S1)·(S0 NAND S0)│
 * │  0 │  1 │ 25-50%   │ 🟡 Amaril │ F = S1'·S0                   │
 * │  1 │  0 │ 50-75%   │ 🟢 Verde  │ F = S1                        │
 * │  1 │  1 │ 75-100%  │ 🟢 Verde  │ F = S1                        │
 * └────┴────┴──────────┴────────────┴───────────────────────────────┘
 */

// ─────────────────────────────────────────────────────────────────
// 1. DECODIFICADOR DE SENSOR DE NIVEL (2 bits: S1, S0)
// ─────────────────────────────────────────────────────────────────
/**
 * Convierte un porcentaje de nivel a código binario de 2 bits (S1,S0).
 * @param {number} porcentaje - 0 a 100
 * @returns {{ code: string, label: string, status: string }}
 */
export function calcularBinarioNivel(porcentaje) {
  if (porcentaje >= 75) return { code: '11', label: 'Lleno (75%-100%)',  status: 'Verde' };
  if (porcentaje >= 50) return { code: '10', label: 'Medio (50%-75%)',   status: 'Verde' };
  if (porcentaje >= 25) return { code: '01', label: 'Bajo (25%-50%)',    status: 'Amarillo' };
  return               { code: '00', label: 'Crítico (<25%)',            status: 'Rojo' };
}

// ─────────────────────────────────────────────────────────────────
// 2. COMPUERTAS LÓGICAS BÁSICAS
// ─────────────────────────────────────────────────────────────────

/** Compuerta AND: salida 1 solo si ambas entradas son 1 */
export const AND  = (a, b) => a && b;

/** Compuerta OR: salida 1 si al menos una entrada es 1 */
export const OR   = (a, b) => a || b;

/** Compuerta NOT: inversión de la entrada */
export const NOT  = (a)    => !a;

/**
 * Compuerta NAND (NOT-AND): F = (A·B)'
 * Equivale a AND seguido de NOT. Es una compuerta universal.
 * Usada en el circuito para implementar el detector de nivel crítico.
 */
export const NAND = (a, b) => !(a && b);

/**
 * Compuerta NOR (NOT-OR): F = (A+B)'
 * Equivale a OR seguido de NOT. También es compuerta universal.
 * Usada para detectar el estado 00 (ambas entradas en 0).
 */
export const NOR  = (a, b) => !(a || b);

/**
 * Compuerta XNOR (equivalencia): F = (A⊕B)'
 * Salida 1 cuando ambas entradas son iguales.
 */
export const XNOR = (a, b) => a === b;

// ─────────────────────────────────────────────────────────────────
// 3. MAPAS DE KARNAUGH & EXPRESIONES DE COMPUERTAS LÓGICAS
// ─────────────────────────────────────────────────────────────────
/**
 * Evalúa el estado de los LEDs usando compuertas lógicas y K-Map.
 *
 * Implementación con compuertas universales:
 *   - LED Rojo    → NAND universal: F_rojo    = NAND(NAND(S1,S1), NAND(S0,S0)) = S1'·S0' = NOR(S1,S0)
 *   - LED Amarillo→ AND+NOT:        F_amarillo = S1'·S0
 *   - LED Verde   → identidad S1:   F_verde    = S1
 *
 * @param {string} codigoBinario - '00' | '01' | '10' | '11'
 * @returns {{ ledRojo: boolean, ledAmarillo: boolean, ledVerde: boolean, ... }}
 */
export function evaluarLogicaAlertas(codigoBinario) {
  const s1 = codigoBinario[0] === '1';
  const s0 = codigoBinario[1] === '1';

  // ── Expresiones de Karnaugh ──────────────────────────────────
  // m0 = S1'·S0' (00 → Rojo)   — Mintermino 0
  // m1 = S1'·S0  (01 → Amarillo)— Mintermino 1
  // m2+m3 = S1   (10,11 → Verde)— Minterminos 2 y 3
  // ──────────────────────────────────────────────────────────────

  // LED Rojo usando NAND universal: NAND(NAND(S1,S1), NAND(S0,S0)) = NOT(S1)·NOT(S0) = NOR(S1,S0)
  const notS1 = NAND(s1, s1); // NAND como inversor: NAND(x,x) = NOT(x)
  const notS0 = NAND(s0, s0); // NAND como inversor
  const ledRojo     = AND(notS1, notS0); // S1'·S0' ≡ NOR(S1,S0) — Compuerta NOR / Mintermino m0

  // LED Amarillo: AND(NOT S1, S0) → compuerta AND con NOT en entrada S1
  const ledAmarillo = AND(notS1, s0);    // S1'·S0 — AND + NOT Gate / Mintermino m1

  // LED Verde: S1 activo (cubre minterminos m2 y m3)
  const ledVerde    = s1;                // F_verde = S1

  return {
    ledRojo,
    ledAmarillo,
    ledVerde,
    // Expresiones booleanas para documentación / UI
    karnaughRojo:     "F_rojo = NAND(NAND(S1,S1), NAND(S0,S0)) = S1'·S0' = NOR(S1,S0) [Mintermino m₀]",
    karnaughAmarillo: "F_amarillo = AND(NOT S1, S0) = S1'·S0 [AND+NOT Gate / Mintermino m₁]",
    karnaughVerde:    "F_verde = S1 [S1 Active High / Minterminos m₂ + m₃]",
    // Compuertas intermedias (para visualización en UI)
    compuertas: {
      notS1_nand: `NAND(${s1?1:0},${s1?1:0}) = ${notS1?1:0}`,
      notS0_nand: `NAND(${s0?1:0},${s0?1:0}) = ${notS0?1:0}`,
      nor_result: `NOR(${s1?1:0},${s0?1:0}) = ${AND(notS1,notS0)?1:0}`,
      nor_gate:   NOR(s1, s0), // Verificación con NOR directo
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// 4. ARITMÉTICA BINARIA — CONVERSIÓN DECIMAL A BINARIO (COMA FIJA)
// ─────────────────────────────────────────────────────────────────
/**
 * Convierte un número decimal a su representación binaria de coma fija.
 * Parte entera: conversión estándar.
 * Parte fraccionaria: método de multiplicaciones sucesivas por 2 (máx 6 bits).
 * Usado para registrar totales de ventas en Sistemas Digitales (SD).
 *
 * @param {number} numero - Valor decimal
 * @returns {string} - Representación binaria "parteEntera.parteFraccionaria"
 */
export function decimalABinario(numero) {
  if (numero === 0) return '0';
  const entero   = Math.floor(numero);
  const fraccion = numero - entero;

  let binEntero  = entero.toString(2);
  let binFraccion = '';
  let tempFrac    = fraccion;

  // Convertir fracción a binario — multiplicaciones sucesivas por 2
  for (let i = 0; i < 6; i++) {
    if (tempFrac === 0) break;
    tempFrac *= 2;
    if (tempFrac >= 1) {
      binFraccion += '1';
      tempFrac    -= 1;
    } else {
      binFraccion += '0';
    }
  }

  return binFraccion ? `${binEntero}.${binFraccion}` : binEntero;
}

// ─────────────────────────────────────────────────────────────────
// 5. DECODIFICADOR DE TIPO DE COMBUSTIBLE (2 bits)
// ─────────────────────────────────────────────────────────────────
/**
 * Decodifica el código de 2 bits al tipo de combustible correspondiente.
 * Código → 00: Gasolina Especial | 01: Diesel | 10: Premium | 11: GNV
 * @param {string} codigo - '00' | '01' | '10' | '11'
 * @returns {{ nombre: string, precio: number, unidad: string }}
 */
export function decodificarCombustible(codigo) {
  const tabla = {
    '00': { nombre: 'Gasolina Especial',      precio: 3.74, unidad: 'L' },
    '01': { nombre: 'Diesel Oil',             precio: 3.72, unidad: 'L' },
    '10': { nombre: 'Gasolina Premium Ultra', precio: 4.79, unidad: 'L' },
    '11': { nombre: 'GNV Vehicular',          precio: 1.66, unidad: 'm³' },
  };
  return tabla[codigo] || { nombre: 'Desconocido', precio: 0, unidad: 'L' };
}
