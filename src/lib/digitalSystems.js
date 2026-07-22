/**
 * Módulo de Lógica Digital y Sistemas Digitales (SD)
 * Para "El Surtidor Cochabambino"
 */

// 1. Decodificador de Sensor de Nivel en Binario (2 bits: S1, S0)
export function calcularBinarioNivel(porcentaje) {
  if (porcentaje >= 75) return { code: '11', label: 'Lleno (75%-100%)', status: 'Verde' };
  if (porcentaje >= 50) return { code: '10', label: 'Medio (50%-75%)', status: 'Verde' };
  if (porcentaje >= 25) return { code: '01', label: 'Bajo (25%-50%)', status: 'Amarillo' };
  return { code: '00', label: 'Crítico (<25%)', status: 'Rojo' };
}

// 2. Mapas de Karnaugh & Expresiones de Compuertas Lógicas
export function evaluarLogicaAlertas(codigoBinario) {
  const s1 = codigoBinario[0] === '1';
  const s0 = codigoBinario[1] === '1';

  // Expresiones de Karnaugh:
  // m0 = S1' S0' (00 -> Rojo)
  // m1 = S1' S0  (01 -> Amarillo)
  // m2, m3 = S1  (10, 11 -> Verde/Normal)
  const ledRojo = !s1 && !s0; // Compuerta NOR: (S1 + S0)'
  const ledAmarillo = !s1 && s0; // Compuerta AND con not: S1' · S0
  const ledVerde = s1; // S1 alto

  return {
    ledRojo,
    ledAmarillo,
    ledVerde,
    karnaughRojo: "F_rojo = S1' · S0' = (S1 + S0)' [NOR Gate / Mintermino m0]",
    karnaughAmarillo: "F_amarillo = S1' · S0 [AND/NOT Gate / Mintermino m1]",
    karnaughVerde: "F_verde = S1 [S1 Active High / Minterminos m2 + m3]",
  };
}

// 3. Aritmética Binaria: Conversión de decimal a representación binaria de coma fija
export function decimalABinario(numero) {
  const entero = Math.floor(numero);
  const fraccion = numero - entero;

  let binEntero = entero.toString(2);
  let binFraccion = '';
  let tempFrac = fraccion;
  
  // Convertir fracción a binario (máx 8 bits de precisión)
  for (let i = 0; i < 6; i++) {
    if (tempFrac === 0) break;
    tempFrac *= 2;
    if (tempFrac >= 1) {
      binFraccion += '1';
      tempFrac -= 1;
    } else {
      binFraccion += '0';
    }
  }

  return binFraccion ? `${binEntero}.${binFraccion}` : binEntero;
}
