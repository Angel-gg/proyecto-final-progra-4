'use client';

import { useState, useEffect } from 'react';
import { Check, Fuel } from 'lucide-react';
import { calcularBinarioNivel } from '@/lib/digitalSystems';

const COMBUSTIBLES = [
  'Gasolina Especial (Bs 3.74/L)',
  'Diesel Oil (Bs 3.72/L)',
  'Gasolina Premium Ultra (Bs 4.79/L)',
  'GNV Vehicular (Bs 1.66/m3)',
];

/**
 * SurtidorModal - Modal para crear o editar un surtidor
 * Muestra preview del código binario del sensor en tiempo real.
 */
export default function SurtidorModal({ surtidor, surtidoresCount, onClose, onSubmit }) {
  const isEditing = Boolean(surtidor);

  const [numSurtidor, setNumSurtidor] = useState('');
  const [typeCombustible, setTypeCombustible] = useState(COMBUSTIBLES[0]);
  const [capacidad, setCapacidad] = useState('10000');
  const [nivelLitros, setNivelLitros] = useState('5000');
  const [loading, setLoading] = useState(false);

  // Inicializar con datos del surtidor si estamos editando
  useEffect(() => {
    if (surtidor) {
      setNumSurtidor(String(surtidor.numero));
      setTypeCombustible(surtidor.combustible);
      setCapacidad(String(surtidor.capacidad));
      setNivelLitros(String(surtidor.nivelLitros));
    } else {
      setNumSurtidor(String(surtidoresCount + 1));
      setTypeCombustible(COMBUSTIBLES[0]);
      setCapacidad('10000');
      setNivelLitros('5000');
    }
  }, [surtidor, surtidoresCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      ...(isEditing && { id: surtidor.id }),
      numero: numSurtidor,
      combustible: typeCombustible,
      capacidad,
      nivelLitros,
    };
    await onSubmit(data, isEditing);
    setLoading(false);
  };

  // Preview del código binario en tiempo real
  const porcentajePrevio = capacidad > 0
    ? (Number(nivelLitros) / Number(capacidad)) * 100
    : 0;
  const binarioPrevio = calcularBinarioNivel(porcentajePrevio);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-title">
          <Fuel style={{ color: 'var(--accent-cyan)' }} />
          {isEditing ? 'Editar Surtidor' : 'Agregar Nuevo Surtidor'}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Número de Surtidor</label>
            <input
              type="number" min="1"
              className="form-control"
              value={numSurtidor}
              onChange={(e) => setNumSurtidor(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Combustible</label>
            <select
              className="form-control"
              value={typeCombustible}
              onChange={(e) => setTypeCombustible(e.target.value)}
            >
              {COMBUSTIBLES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Capacidad Máxima (Litros)</label>
            <input
              type="number" min="1"
              className="form-control"
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nivel Actual (Litros)</label>
            <input
              type="number" min="0"
              className="form-control"
              value={nivelLitros}
              onChange={(e) => setNivelLitros(e.target.value)}
              required
            />
          </div>

          {/* Preview de código binario del sensor en tiempo real */}
          {capacidad && nivelLitros && (
            <div className="sd-info-box" style={{ marginBottom: '1rem' }}>
              <div className="sd-row">
                <span className="sd-label">Nivel Previsto:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {porcentajePrevio.toFixed(1)}%
                </span>
              </div>
              <div className="sd-row">
                <span className="sd-label">Código Sensor (S1,S0):</span>
                <span className="binary-badge">{binarioPrevio.code}</span>
              </div>
              <div className="sd-row">
                <span className="sd-label">Estado K-Map:</span>
                <span style={{
                  fontWeight: 600,
                  color: binarioPrevio.status === 'Rojo'
                    ? 'var(--accent-rose)'
                    : binarioPrevio.status === 'Amarillo'
                    ? 'var(--accent-amber)'
                    : 'var(--accent-emerald)'
                }}>
                  {binarioPrevio.label}
                </span>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando…' : <><Check /> {isEditing ? 'Actualizar' : 'Crear Surtidor'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
