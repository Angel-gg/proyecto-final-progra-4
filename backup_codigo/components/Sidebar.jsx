'use client';

import { Volume2 } from 'lucide-react';
import { BarChart3, Fuel, DollarSign, AlertTriangle, Layers } from 'lucide-react';
import { Cpu } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',  icon: BarChart3,     label: 'Dashboard Principal' },
  { id: 'surtidores', icon: Fuel,          label: 'Gestión Surtidores' },
  { id: 'ventas',     icon: DollarSign,    label: 'Registro de Ventas' },
  { id: 'alertas',    icon: AlertTriangle, label: 'Panel de Alertas (SD)' },
  { id: 'reportes',   icon: Layers,        label: 'Reportes & Karnaugh' },
];

/**
 * Sidebar - Barra lateral de navegación con brand, nav items y widget de voz.
 */
export default function Sidebar({
  activeTab,
  onTabChange,
  alertasActivasCount,
  isListening,
  speechTranscript,
  onToggleVoice,
}) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand-header">
        <div className="brand-icon">
          <Cpu />
        </div>
        <div>
          <div className="brand-title">El Surtidor</div>
          <div className="brand-subtitle">Cochabambino SD</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-menu">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => onTabChange(id)}
          >
            <Icon />
            <span>{label}</span>
            {id === 'alertas' && alertasActivasCount > 0 && (
              <span className="nav-badge">{alertasActivasCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Web Speech API Widget */}
      <div className="voice-widget">
        <div className="voice-header">
          <span className="voice-label">🎤 Web Speech API</span>
          <button
            onClick={onToggleVoice}
            className={`voice-btn ${isListening ? 'listening' : 'idle'}`}
            title={isListening ? 'Detener reconocimiento' : 'Iniciar reconocimiento de voz'}
          >
            <Volume2 />
          </button>
        </div>
        <div className="voice-hint">
          {isListening
            ? '🔴 Escuchando… Di "Ventas", "Surtidores", "Alertas"'
            : 'Clic para usar comandos de voz'}
        </div>
        {speechTranscript && (
          <div className="voice-transcript">"{speechTranscript}"</div>
        )}
      </div>
    </aside>
  );
}
