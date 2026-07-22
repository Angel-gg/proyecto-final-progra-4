'use client';

/**
 * KarnaughMap - Visualización interactiva de un Mapa de Karnaugh 2x2
 * Muestra una cuadrícula 3x3 (encabezados + 4 celdas de datos).
 *
 * Props:
 *  - title: string
 *  - activeMinterm: 0 | 1 | 2 | 3  (minterminó que se resalta)
 *  - expression: string (expresión booleana simplificada)
 *  - gate: string (nombre de la compuerta lógica)
 *  - gateColor: string (color CSS)
 */
export default function KarnaughMap({ title, icon: Icon, activeMinterm, expression, gate, gateColor }) {
  // Definir el color de cada celda según el minterminó activo
  const cellColors = {
    0: 'active-red',
    1: 'active-yellow',
    2: 'active-green',
    3: 'active-green',
  };

  const getCellClass = (index) => {
    if (index === activeMinterm) return cellColors[activeMinterm] || '';
    // Celdas no activas aún llevan su "color de fondo temático"
    if (index === 0 && activeMinterm !== 0) return '';
    if (index === 1 && activeMinterm !== 1) return '';
    return '';
  };

  // Valores de cada celda (1 si es el minterminó activo, 0 si no)
  const cellValue = (index) => (index === activeMinterm ? '1' : '0');
  const mintermLabel = (index) => `m${index === activeMinterm ? `₀` : index === 0 ? '₀' : index === 1 ? '₁' : index === 2 ? '₂' : '₃'}`;

  // Map de índice a mintermino subscript
  const subscripts = ['₀', '₁', '₂', '₃'];

  return (
    <div className="card">
      <div className="report-card-title">
        {Icon && <Icon />}
        {title}
      </div>

      {/* Grid K-Map: cabecera + 4 celdas */}
      <div className="karnaugh-grid">
        {/* Fila de encabezado */}
        <div className="karnaugh-cell karnaugh-header">S1 \ S0</div>
        <div className="karnaugh-cell karnaugh-header">0</div>
        <div className="karnaugh-cell karnaugh-header">1</div>

        {/* Fila S1 = 0 */}
        <div className="karnaugh-cell karnaugh-header">0</div>
        <div className={`karnaugh-cell ${getCellClass(0)}`}>
          {cellValue(0)} {activeMinterm === 0 ? '(m₀ ✓)' : ''}
        </div>
        <div className={`karnaugh-cell ${getCellClass(1)}`}>
          {cellValue(1)} {activeMinterm === 1 ? '(m₁ ✓)' : ''}
        </div>

        {/* Fila S1 = 1 */}
        <div className="karnaugh-cell karnaugh-header">1</div>
        <div className={`karnaugh-cell ${getCellClass(2)}`}>
          {cellValue(2)} {activeMinterm === 2 ? '(m₂ ✓)' : ''}
        </div>
        <div className={`karnaugh-cell ${getCellClass(3)}`}>
          {cellValue(3)} {activeMinterm === 3 ? '(m₃ ✓)' : ''}
        </div>
      </div>

      {/* Expresión Booleana */}
      <div className="sd-info-box" style={{ marginTop: '0.85rem' }}>
        <div className="sd-row">
          <span className="sd-label">Expresión Simplificada:</span>
          <span className="binary-badge">{expression}</span>
        </div>
        <div className="sd-row">
          <span className="sd-label">Compuerta Equivalente:</span>
          <span style={{ color: gateColor, fontWeight: 700 }}>{gate}</span>
        </div>
      </div>
    </div>
  );
}
