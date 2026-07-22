'use client';

import { evaluarLogicaAlertas } from '@/lib/digitalSystems';
import { Edit3, Trash2 } from 'lucide-react';

/**
 * SurtidorCard - Tarjeta individual de surtidor
 * Muestra nivel del tanque, código binario del sensor (S1,S0),
 * estado LED por lógica de Karnaugh y acciones de editar/eliminar.
 */
export default function SurtidorCard({ surtidor, onEdit, onDelete, showActions = true }) {
  const { nivelLitros, capacidad, codigoBinario, combustible, numero, estado } = surtidor;
  const porcentaje = (nivelLitros / capacidad) * 100;

  // Evaluar lógica de compuertas (K-Map)
  const { ledRojo, ledAmarillo } = evaluarLogicaAlertas(codigoBinario);
  const ledClass = ledRojo ? 'rojo' : ledAmarillo ? 'amarillo' : 'verde';
  const estadoLabel = ledRojo ? 'CRÍTICO (m₀)' : ledAmarillo ? 'BAJO (m₁)' : 'NORMAL (m₂/m₃)';
  const estadoColor = ledRojo
    ? 'var(--accent-rose)'
    : ledAmarillo
    ? 'var(--accent-amber)'
    : 'var(--accent-emerald)';

  return (
    <div className={`card surtidor-card status-${ledClass}`}>
      <div className="surtidor-header">
        <div className="surtidor-num">
          <span className={`led-indicator ${ledClass}`} />
          <span>Surtidor #{numero}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="fuel-badge">{combustible.split('(')[0].trim()}</span>
          {showActions && (
            <div className="surtidor-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => onEdit(surtidor)} title="Editar">
                <Edit3 />
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(surtidor.id)} title="Eliminar">
                <Trash2 />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Barra de nivel */}
      <div className="tank-container">
        <div className="tank-info">
          <span>{nivelLitros.toLocaleString()} / {capacidad.toLocaleString()} L</span>
          <span className="tank-percentage">{porcentaje.toFixed(1)}%</span>
        </div>
        <div className="tank-bar-outer">
          <div
            className={`tank-bar-inner ${ledClass}`}
            style={{ width: `${Math.min(porcentaje, 100)}%` }}
          />
        </div>
      </div>

      {/* Información SD: Sensor binario y estado por K-Map */}
      <div className="sd-info-box">
        <div className="sd-row">
          <span className="sd-label">Sensor (S1, S0):</span>
          <span className="binary-badge">{codigoBinario}</span>
        </div>
        <div className="sd-row">
          <span className="sd-label">Lógica K-Map:</span>
          <span style={{ color: estadoColor, fontWeight: 700 }}>{estadoLabel}</span>
        </div>
        {showActions && (
          <div className="sd-row">
            <span className="sd-label">Estado BD:</span>
            <span style={{
              color: estado === 'OPERATIVO' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              fontWeight: 600
            }}>
              {estado}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
