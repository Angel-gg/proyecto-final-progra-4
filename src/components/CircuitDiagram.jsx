'use client';

/**
 * CircuitDiagram — Visualizador SVG del circuito de compuertas lógicas
 * =====================================================================
 * Muestra el circuito NAND/AND/NOR que activa los LEDs según S1 y S0.
 * Las compuertas se colorean con el estado actual (activo/inactivo).
 *
 * Props:
 *  - codigoBinario: '00' | '01' | '10' | '11'
 */

import { evaluarLogicaAlertas } from '@/lib/digitalSystems';

export default function CircuitDiagram({ codigoBinario = '11' }) {
  const s1 = codigoBinario[0] === '1';
  const s0 = codigoBinario[1] === '1';
  const { ledRojo, ledAmarillo, ledVerde, compuertas } = evaluarLogicaAlertas(codigoBinario);

  const ON   = '#06b6d4';
  const OFF  = 'rgba(255,255,255,0.15)';
  const RED  = '#ef4444';
  const YEL  = '#f59e0b';
  const GRN  = '#10b981';
  const WIRE = (active) => active ? ON : OFF;

  const ledColor = ledRojo ? RED : ledAmarillo ? YEL : GRN;
  const ledLabel = ledRojo ? 'CRÍTICO' : ledAmarillo ? 'BAJO' : 'NORMAL';

  return (
    <div className="circuit-wrapper">
      <div className="circuit-title">
        <span>Circuito de Compuertas — Entradas: S1={s1?1:0}, S0={s0?1:0}</span>
        <span className="circuit-badge" style={{ color: ledColor }}>● {ledLabel}</span>
      </div>

      <svg
        viewBox="0 0 560 240"
        className="circuit-svg"
        aria-label={`Diagrama de circuito digital. Entradas S1=${s1?1:0} S0=${s0?1:0}. Estado: ${ledLabel}`}
      >
        {/* ── Labels de entrada ── */}
        <text x="12" y="58"  fill={WIRE(s1)}  fontSize="13" fontWeight="700" fontFamily="JetBrains Mono, monospace">S1={s1?1:0}</text>
        <text x="12" y="118" fill={WIRE(!s1)} fontSize="13" fontWeight="700" fontFamily="JetBrains Mono, monospace">S1'</text>
        <text x="12" y="178" fill={WIRE(s0)}  fontSize="13" fontWeight="700" fontFamily="JetBrains Mono, monospace">S0={s0?1:0}</text>

        {/* ─── NAND como inversor de S1 (NAND(S1,S1) = NOT S1) ─── */}
        {/* wire S1 → NAND1 */}
        <line x1="65" y1="55" x2="105" y2="55" stroke={WIRE(s1)} strokeWidth="2" />
        <line x1="65" y1="55" x2="65"  y2="75" stroke={WIRE(s1)} strokeWidth="2" />
        <line x1="65" y1="75" x2="105" y2="75" stroke={WIRE(s1)} strokeWidth="2" />

        {/* NAND1 gate shape */}
        <rect x="105" y="48" width="50" height="34" rx="4" fill="rgba(6,182,212,0.1)" stroke={WIRE(!s1)} strokeWidth="1.5"/>
        <circle cx="155" cy="65" r="5" fill="none" stroke={WIRE(!s1)} strokeWidth="1.5"/>
        <text x="115" y="69" fill={WIRE(!s1)} fontSize="10" fontWeight="600">NAND</text>
        {/* Output NOT S1 */}
        <line x1="160" y1="65" x2="195" y2="65" stroke={WIRE(!s1)} strokeWidth="2" />
        <text x="162" y="60" fill={WIRE(!s1)} fontSize="9">S1'={!s1?1:0}</text>

        {/* ─── NAND como inversor de S0 (NAND(S0,S0) = NOT S0) ─── */}
        <line x1="65" y1="175" x2="105" y2="175" stroke={WIRE(s0)} strokeWidth="2" />
        <line x1="65" y1="175" x2="65"  y2="195" stroke={WIRE(s0)} strokeWidth="2" />
        <line x1="65" y1="195" x2="105" y2="195" stroke={WIRE(s0)} strokeWidth="2" />

        <rect x="105" y="168" width="50" height="34" rx="4" fill="rgba(6,182,212,0.1)" stroke={WIRE(!s0)} strokeWidth="1.5"/>
        <circle cx="155" cy="185" r="5" fill="none" stroke={WIRE(!s0)} strokeWidth="1.5"/>
        <text x="115" y="189" fill={WIRE(!s0)} fontSize="10" fontWeight="600">NAND</text>
        <line x1="160" y1="185" x2="195" y2="185" stroke={WIRE(!s0)} strokeWidth="2" />
        <text x="162" y="180" fill={WIRE(!s0)} fontSize="9">S0'={!s0?1:0}</text>

        {/* ─── AND gate (S1'·S0' → LED Rojo via NOR verificado) ─── */}
        <line x1="195" y1="65"  x2="225" y2="125" stroke={WIRE(!s1)} strokeWidth="2" />
        <line x1="195" y1="185" x2="225" y2="145" stroke={WIRE(!s0)} strokeWidth="2" />

        <rect x="225" y="118" width="52" height="34" rx="4" fill="rgba(239,68,68,0.1)" stroke={WIRE(ledRojo)} strokeWidth="1.5"/>
        <text x="230" y="139" fill={WIRE(ledRojo)} fontSize="10" fontWeight="600">NOR</text>
        <line x1="277" y1="135" x2="320" y2="135" stroke={WIRE(ledRojo)} strokeWidth="2" />

        {/* ─── AND gate (S1'·S0 → LED Amarillo) ─── */}
        <line x1="195" y1="65"  x2="225" y2="78"  stroke={WIRE(!s1)} strokeWidth="2" />
        <line x1="195" y1="175" x2="225" y2="93"  stroke={WIRE(s0)}  strokeWidth="2" />

        <rect x="225" y="68" width="52" height="34" rx="4" fill="rgba(245,158,11,0.1)" stroke={WIRE(ledAmarillo)} strokeWidth="1.5"/>
        <text x="231" y="89" fill={WIRE(ledAmarillo)} fontSize="10" fontWeight="600">AND</text>
        <line x1="277" y1="85"  x2="320" y2="85"  stroke={WIRE(ledAmarillo)} strokeWidth="2" />

        {/* ─── LED Rojo ─── */}
        <circle cx="338" cy="135" r="14" fill={ledRojo ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.06)'} stroke={RED} strokeWidth="1.5"/>
        <circle cx="338" cy="135" r="8"  fill={ledRojo ? RED : 'transparent'}/>
        {ledRojo && <circle cx="338" cy="135" r="16" fill="none" stroke={RED} strokeWidth="1" opacity="0.4"><animate attributeName="r" values="14;22;14" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite"/></circle>}
        <text x="338" y="157" fill={RED} fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono,monospace">LED🔴</text>
        <text x="338" y="168" fill={RED} fontSize="8" textAnchor="middle">m₀ NOR</text>

        {/* ─── LED Amarillo ─── */}
        <circle cx="338" cy="85"  r="14" fill={ledAmarillo ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.06)'} stroke={YEL} strokeWidth="1.5"/>
        <circle cx="338" cy="85"  r="8"  fill={ledAmarillo ? YEL : 'transparent'}/>
        {ledAmarillo && <circle cx="338" cy="85" r="16" fill="none" stroke={YEL} strokeWidth="1" opacity="0.4"><animate attributeName="r" values="14;22;14" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite"/></circle>}
        <text x="338" y="107" fill={YEL} fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono,monospace">LED🟡</text>
        <text x="338" y="118" fill={YEL} fontSize="8" textAnchor="middle">m₁ AND</text>

        {/* ─── LED Verde (S1 directo) ─── */}
        <line x1="65" y1="55" x2="65"  y2="35"  stroke={WIRE(s1)} strokeWidth="2" />
        <line x1="65" y1="35" x2="338" y2="35"  stroke={WIRE(s1)} strokeWidth="2" />
        <line x1="338" y1="35" x2="338" y2="54" stroke={WIRE(s1)} strokeWidth="2" />

        <circle cx="338" cy="40"  r="14" fill={ledVerde ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.06)'} stroke={GRN} strokeWidth="1.5"/>
        <circle cx="338" cy="40"  r="8"  fill={ledVerde ? GRN : 'transparent'}/>
        {ledVerde && <circle cx="338" cy="40" r="16" fill="none" stroke={GRN} strokeWidth="1" opacity="0.4"><animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/></circle>}
        <text x="338" y="24"  fill={GRN} fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono,monospace">LED🟢</text>
        <text x="338" y="15"  fill={GRN} fontSize="8" textAnchor="middle">m₂/m₃ S1</text>

        {/* ─── Info lateral compuertas ─── */}
        <text x="390" y="30"  fill="rgba(255,255,255,0.5)" fontSize="9">Compuertas intermedias:</text>
        <text x="390" y="46"  fill={WIRE(!s1)} fontSize="9" fontFamily="JetBrains Mono,monospace">{compuertas?.notS1_nand}</text>
        <text x="390" y="62"  fill={WIRE(!s0)} fontSize="9" fontFamily="JetBrains Mono,monospace">{compuertas?.notS0_nand}</text>
        <text x="390" y="78"  fill={WIRE(ledRojo)} fontSize="9" fontFamily="JetBrains Mono,monospace">{compuertas?.nor_result}</text>
        <text x="390" y="100" fill="rgba(255,255,255,0.5)" fontSize="9">Verificación NOR directa:</text>
        <text x="390" y="116" fill={compuertas?.nor_gate ? WIRE(true) : OFF} fontSize="9" fontFamily="JetBrains Mono,monospace">NOR({s1?1:0},{s0?1:0})={compuertas?.nor_gate?1:0}</text>
      </svg>

      <div className="circuit-legend">
        <span style={{ color: ON }}>━ Señal activa</span>
        <span style={{ color: OFF }}>━ Señal inactiva</span>
        <span style={{ color: RED }}>● LED Rojo (NOR/m₀)</span>
        <span style={{ color: YEL }}>● LED Amarillo (AND/m₁)</span>
        <span style={{ color: GRN }}>● LED Verde (S1/m₂₋₃)</span>
      </div>
    </div>
  );
}
