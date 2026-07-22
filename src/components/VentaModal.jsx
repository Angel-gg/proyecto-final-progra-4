'use client';

import { useState } from 'react';
import { Check, DollarSign } from 'lucide-react';
import { decimalABinario } from '@/lib/digitalSystems';

/**
 * VentaModal - Modal para registrar una nueva venta
 * Incluye preview de total y conversión a binario (Aritmética Binaria - SD)
 */
export default function VentaModal({ surtidores, onClose, onSubmit }) {
  const [selectedSurtidorId, setSelectedSurtidorId] = useState('');
  const [litrosVenta, setLitrosVenta] = useState('');
  const [precioVenta, setPrecioVenta] = useState('3.74');
  const [loading, setLoading] = useState(false);

  const handleSurtidorChange = (e) => {
    setSelectedSurtidorId(e.target.value);
    const s = surtidores.find(x => x.id === Number(e.target.value));
    if (s) {
      if (s.combustible.includes('Premium')) setPrecioVenta('4.79');
      else if (s.combustible.includes('Diesel')) setPrecioVenta('3.72');
      else if (s.combustible.includes('GNV')) setPrecioVenta('1.66');
      else setPrecioVenta('3.74');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ surtidorId: selectedSurtidorId, litros: litrosVenta, precioPorLitro: precioVenta });
    setLoading(false);
  };

  const totalEstimado = Number(litrosVenta) * Number(precioVenta);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-title">
          <DollarSign style={{ color: 'var(--accent-emerald)' }} />
          Registrar Nueva Venta
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Seleccionar Surtidor</label>
            <select
              className="form-control"
              value={selectedSurtidorId}
              onChange={handleSurtidorChange}
              required
            >
              <option value="">— Seleccionar surtidor —</option>
              {surtidores.map(s => (
                <option key={s.id} value={s.id}>
                  #{s.numero} — {s.combustible.split('(')[0].trim()} ({s.nivelLitros}L disp.)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Litros a Despachar</label>
            <input
              type="number" step="0.1" min="0.1"
              className="form-control"
              placeholder="Ej: 45.5"
              value={litrosVenta}
              onChange={(e) => setLitrosVenta(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Precio por Litro (Bs)</label>
            <input
              type="number" step="0.01"
              className="form-control"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
              required
            />
          </div>

          {/* Preview de conversión binaria en tiempo real */}
          {litrosVenta && Number(litrosVenta) > 0 && (
            <div className="sd-info-box" style={{ marginBottom: '1rem' }}>
              <div className="sd-row">
                <span className="sd-label">Total Estimado:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  Bs. {totalEstimado.toFixed(2)}
                </span>
              </div>
              <div className="sd-row">
                <span className="sd-label">Aritmética Binaria (SD):</span>
                <span className="binary-badge">
                  {decimalABinario(totalEstimado)} ₂
                </span>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Procesando…' : <><Check /> Procesar Venta</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
