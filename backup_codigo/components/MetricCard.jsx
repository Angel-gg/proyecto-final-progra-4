'use client';

/**
 * MetricCard - Tarjeta de KPI para el dashboard
 * Muestra un valor numérico con ícono, etiqueta y subtexto.
 */
export default function MetricCard({ label, value, subValue, icon: Icon, color = 'cyan' }) {
  return (
    <div className={`card metric-card ${color}`}>
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        <div className={`metric-icon ${color}`}>
          <Icon />
        </div>
      </div>
      <div className="metric-value">{value}</div>
      {subValue && (
        <div className={`metric-sub ${color === 'rose' ? 'danger' : color === 'amber' ? 'warning' : 'success'}`}>
          {subValue}
        </div>
      )}
    </div>
  );
}
