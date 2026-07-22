'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  DollarSign,
  PlusCircle,
  Droplets,
  Activity,
  Zap,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  FileText,
  Clock,
  Binary,
  Fuel,
  BarChart3,
  TrendingUp,
  Layers,
} from 'lucide-react';

import Sidebar from '@/components/Sidebar';
import MetricCard from '@/components/MetricCard';
import SurtidorCard from '@/components/SurtidorCard';
import KarnaughMap from '@/components/KarnaughMap';
import VentaModal from '@/components/VentaModal';
import SurtidorModal from '@/components/SurtidorModal';
import { decimalABinario } from '@/lib/digitalSystems';

// ─── Títulos de cada pestaña ───
const PAGE_TITLES = {
  dashboard:  'Dashboard de Control Digital',
  surtidores: 'Monitoreo de Surtidores & Sensores',
  ventas:     'Registro Aritmético de Ventas',
  alertas:    'Circuito de Alertas y Mapas de Karnaugh',
  reportes:   'Reportes & Sistemas Digitales',
};

// ─── Empty State Helper ───
function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="empty-state">
      <Icon />
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-text">{text}</div>
    </div>
  );
}

// ─── Loading Skeletons ───
function LoadingSkeletons({ count = 4 }) {
  return (
    <div className="surtidores-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card" />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [surtidores, setSurtidores] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showVentaModal, setShowVentaModal] = useState(false);
  const [showSurtidorModal, setShowSurtidorModal] = useState(false);
  const [editingSurtidor, setEditingSurtidor] = useState(null);

  // Voice
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');

  // Clipboard
  const [copied, setCopied] = useState(false);

  // ─── Fetch all data ───
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resS, resV, resA] = await Promise.all([
        fetch('/api/surtidores'),
        fetch('/api/ventas'),
        fetch('/api/alertas'),
      ]);
      const [dataS, dataV, dataA] = await Promise.all([
        resS.json(), resV.json(), resA.json(),
      ]);
      if (Array.isArray(dataS)) setSurtidores(dataS);
      if (Array.isArray(dataV)) setVentas(dataV);
      if (Array.isArray(dataA)) setAlertas(dataA);
    } catch {
      toast.error('Error de conexión al cargar datos del servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Web Speech API ───
  const toggleVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.warning('Tu navegador no soporta Web Speech API. Usa Chrome o Edge.');
      return;
    }
    if (isListening) { setIsListening(false); return; }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-BO';
    recognition.interimResults = false;

    recognition.onstart  = () => setIsListening(true);
    recognition.onerror  = () => { setIsListening(false); toast.error('Error en reconocimiento de voz.'); };
    recognition.onend    = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpeechTranscript(transcript);
      setIsListening(false);
      procesarComandoVoz(transcript);
    };
    recognition.start();
  };

  const procesarComandoVoz = (cmd) => {
    const t = cmd.toLowerCase();
    if (t.includes('surtidor'))       { setActiveTab('surtidores'); toast.info('📡 Navegando a Surtidores'); }
    else if (t.includes('venta'))     { setActiveTab('ventas'); setShowVentaModal(true); toast.info('💰 Abriendo Registro de Ventas'); }
    else if (t.includes('alerta'))    { setActiveTab('alertas'); toast.info('⚠️ Navegando a Alertas'); }
    else if (t.includes('reporte'))   { setActiveTab('reportes'); toast.info('📊 Navegando a Reportes'); }
    else if (t.includes('inicio') || t.includes('dashboard')) { setActiveTab('dashboard'); toast.info('🏠 Volviendo al Dashboard'); }
    else { toast.warning(`Comando no reconocido: "${cmd}"`); }
  };

  // ─── Clipboard API ───
  const copiarReporte = () => {
    const totalIngresos = ventas.reduce((a, v) => a + v.total, 0);
    const summary = [
      '╔══════════════════════════════════════╗',
      '║  REPORTE - EL SURTIDOR COCHABAMBINO  ║',
      '╚══════════════════════════════════════╝',
      `  Fecha:            ${new Date().toLocaleString('es-BO')}`,
      `  Total Ventas:     Bs. ${totalIngresos.toFixed(2)} (${ventas.length} operaciones)`,
      `  Total Binario:    ${decimalABinario(totalIngresos)} ₂`,
      `  Surtidores:       ${surtidores.length} unidades`,
      `  Alertas Activas:  ${alertas.filter(a => a.estado === 'ACTIVA').length}`,
    ].join('\n');

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      toast.success('Reporte copiado al portapapeles (Clipboard API)');
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => toast.error('No se pudo acceder al portapapeles.'));
  };

  // ─── Submit: Nueva Venta ───
  const handleRegistrarVenta = async (formData) => {
    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(`Error: ${err.error || 'No se pudo registrar la venta.'}`);
        return;
      }
      toast.success('✅ Venta registrada correctamente');
      setShowVentaModal(false);
      fetchData();
    } catch {
      toast.error('Error de red al registrar la venta.');
    }
  };

  // ─── Submit: Guardar/Actualizar Surtidor ───
  const handleGuardarSurtidor = async (formData, isEditing) => {
    try {
      const res = await fetch('/api/surtidores', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(`Error: ${err.error || 'No se pudo guardar el surtidor.'}`);
        return;
      }
      toast.success(isEditing ? '✅ Surtidor actualizado' : '✅ Surtidor creado correctamente');
      setShowSurtidorModal(false);
      setEditingSurtidor(null);
      fetchData();
    } catch {
      toast.error('Error de red al guardar el surtidor.');
    }
  };

  // ─── Delete Surtidor ───
  const handleDeleteSurtidor = async (id) => {
    const confirmed = window.confirm('¿Eliminar este surtidor y todos sus datos asociados?');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/surtidores?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('🗑️ Surtidor eliminado');
        fetchData();
      } else {
        toast.error('No se pudo eliminar el surtidor.');
      }
    } catch {
      toast.error('Error de red al eliminar el surtidor.');
    }
  };

  // ─── Edit Surtidor (abre modal) ───
  const handleEditSurtidor = (surtidor) => {
    setEditingSurtidor(surtidor);
    setShowSurtidorModal(true);
  };

  // ─── KPI calculations ───
  const totalIngresosDecimal  = ventas.reduce((a, v) => a + v.total, 0);
  const totalLitrosVendidos   = ventas.reduce((a, v) => a + v.litros, 0);
  const alertasActivasCount   = alertas.filter(a => a.estado === 'ACTIVA').length;
  const surtidoresOperativos  = surtidores.filter(s => s.estado === 'OPERATIVO').length;

  return (
    <div className="app-container">
      {/* ═══════ SIDEBAR ═══════ */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertasActivasCount={alertasActivasCount}
        isListening={isListening}
        speechTranscript={speechTranscript}
        onToggleVoice={toggleVoiceRecognition}
      />

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="main-content">

        {/* Top Bar */}
        <header className="top-bar">
          <div>
            <h1 className="page-title">{PAGE_TITLES[activeTab]}</h1>
            <p className="page-subtitle">
              Estación "El Surtidor Cochabambino" — Lógica Digital & Prisma SQLite
            </p>
          </div>
          <div className="quick-actions">
            <button className="btn btn-secondary" onClick={copiarReporte}>
              {copied ? <Check /> : <Copy />}
              <span>{copied ? '¡Copiado!' : 'Clipboard API'}</span>
            </button>
            <button className="btn btn-primary" onClick={() => setShowVentaModal(true)}>
              <PlusCircle />
              <span>Nueva Venta</span>
            </button>
          </div>
        </header>

        {/* ═══ KPI METRICS — siempre visibles ═══ */}
        <div className="metrics-grid">
          <MetricCard
            label="Ingresos Totales"
            value={`Bs. ${totalIngresosDecimal.toFixed(2)}`}
            subValue={<><Binary style={{ width: 14, height: 14 }} /> {decimalABinario(totalIngresosDecimal)} ₂</>}
            icon={DollarSign}
            color="emerald"
          />
          <MetricCard
            label="Litros Dispensados"
            value={`${totalLitrosVendidos.toFixed(0)} L`}
            subValue={`${ventas.length} operaciones`}
            icon={Droplets}
            color="cyan"
          />
          <MetricCard
            label="Surtidores"
            value={surtidores.length}
            subValue={<><Activity style={{ width: 14, height: 14 }} /> {surtidoresOperativos} operativos</>}
            icon={Zap}
            color="amber"
          />
          <MetricCard
            label="Alertas K-Map"
            value={alertasActivasCount}
            subValue="LEDs por compuertas lógicas"
            icon={AlertTriangle}
            color="rose"
          />
        </div>

        {/* ═══════════════════════════ TAB: DASHBOARD ═══════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <div className="section-header">
              <h2 className="section-title">Estado en Tiempo Real — Sensores Binarios (S1, S0)</h2>
              <button className="btn btn-secondary btn-sm" onClick={fetchData} disabled={loading}>
                <RefreshCw /> Actualizar
              </button>
            </div>

            {loading ? (
              <LoadingSkeletons count={surtidores.length || 4} />
            ) : surtidores.length === 0 ? (
              <div className="card">
                <EmptyState icon={Fuel} title="Sin surtidores registrados" text='Ve a "Gestión Surtidores" para agregar el primero.' />
              </div>
            ) : (
              <div className="surtidores-grid">
                {surtidores.map(s => (
                  <SurtidorCard
                    key={s.id}
                    surtidor={s}
                    showActions={false}
                  />
                ))}
              </div>
            )}

            {/* Últimas ventas */}
            <div className="card" style={{ marginTop: '1rem' }}>
              <div className="section-header" style={{ marginBottom: '0.85rem' }}>
                <h3 className="section-title" style={{ fontSize: '1rem' }}>
                  <Clock style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6, width: 18, height: 18 }} />
                  Últimas Ventas Registradas
                </h3>
              </div>
              {ventas.length === 0 ? (
                <EmptyState icon={FileText} title="Sin ventas registradas" text='Registra tu primera venta con "Nueva Venta".' />
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Surtidor</th>
                        <th>Combustible</th>
                        <th>Litros</th>
                        <th>Total (Bs)</th>
                        <th>Binario (SD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventas.slice(0, 5).map(v => (
                        <tr key={v.id}>
                          <td>{new Date(v.fecha).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td>#{v.surtidor?.numero || v.surtidorId}</td>
                          <td>{v.combustible?.split('(')[0]?.trim()}</td>
                          <td>{v.litros} L</td>
                          <td className="td-money">Bs. {v.total.toFixed(2)}</td>
                          <td className="td-binary">{v.totalBinario}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════ TAB: SURTIDORES ═══════════════════════════ */}
        {activeTab === 'surtidores' && (
          <div className="fade-in">
            <div className="section-header">
              <h2 className="section-title">Gestión Integral de Surtidores</h2>
              <button
                className="btn btn-primary"
                onClick={() => { setEditingSurtidor(null); setShowSurtidorModal(true); }}
              >
                <PlusCircle /> Agregar Surtidor
              </button>
            </div>

            {loading ? (
              <LoadingSkeletons count={4} />
            ) : surtidores.length === 0 ? (
              <div className="card">
                <EmptyState icon={Fuel} title="Sin surtidores" text="Agrega tu primer surtidor para comenzar." />
              </div>
            ) : (
              <div className="surtidores-grid">
                {surtidores.map(s => (
                  <SurtidorCard
                    key={s.id}
                    surtidor={s}
                    showActions={true}
                    onEdit={handleEditSurtidor}
                    onDelete={handleDeleteSurtidor}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════ TAB: VENTAS ═══════════════════════════ */}
        {activeTab === 'ventas' && (
          <div className="fade-in">
            <div className="section-header">
              <h2 className="section-title">Histórico de Ventas & Aritmética Binaria</h2>
              <button className="btn btn-primary" onClick={() => setShowVentaModal(true)}>
                <PlusCircle /> Nueva Venta
              </button>
            </div>

            <div className="card">
              {ventas.length === 0 ? (
                <EmptyState icon={DollarSign} title="Sin ventas registradas" text="Las ventas aparecerán aquí con su conversión binaria automática." />
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Fecha y Hora</th>
                        <th>Surtidor</th>
                        <th>Litros</th>
                        <th>Precio / L</th>
                        <th>Total (Bs)</th>
                        <th>Binario (SD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventas.map(v => (
                        <tr key={v.id}>
                          <td>#{v.id}</td>
                          <td>{new Date(v.fecha).toLocaleString('es-BO')}</td>
                          <td>#{v.surtidor?.numero || v.surtidorId}</td>
                          <td>{v.litros} L</td>
                          <td>Bs. {v.precioPorLitro.toFixed(2)}</td>
                          <td className="td-money">Bs. {v.total.toFixed(2)}</td>
                          <td className="td-binary">{v.totalBinario}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════ TAB: ALERTAS ═══════════════════════════ */}
        {activeTab === 'alertas' && (
          <div className="fade-in">
            <div className="section-header">
              <h2 className="section-title">Monitoreo de Alertas — Compuertas Lógicas & Karnaugh</h2>
              <button className="btn btn-secondary btn-sm" onClick={fetchData}>
                <RefreshCw /> Refrescar
              </button>
            </div>

            {alertas.length === 0 ? (
              <div className="card">
                <EmptyState icon={Check} title="Sin alertas activas" text="Todos los surtidores operan en niveles normales (m₂/m₃ — LED Verde)" />
              </div>
            ) : (
              <div className="alert-list">
                {alertas.map(a => (
                  <div
                    key={a.id}
                    className={`card alert-card ${a.tipo === 'CRITICO' ? 'critico' : 'bajo'}`}
                  >
                    <div style={{ flex: 1 }}>
                      <div className="alert-header">
                        <span className={`led-indicator ${a.tipo === 'CRITICO' ? 'rojo' : 'amarillo'}`} />
                        <span className={`alert-type ${a.tipo === 'CRITICO' ? 'critico' : 'bajo'}`}>
                          {a.tipo}: Surtidor #{a.surtidor?.numero || a.surtidorId}
                        </span>
                        <span className="alert-date">
                          {new Date(a.fecha).toLocaleString('es-BO')}
                        </span>
                      </div>
                      <p className="alert-message">{a.mensaje}</p>
                      <div className="sd-info-box" style={{ margin: 0, display: 'inline-block' }}>
                        <span className="sd-label">K-Map: </span>
                        <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{a.logicaKarnaugh}</span>
                      </div>
                    </div>
                    <span className={`alert-status-badge ${a.estado === 'ACTIVA' ? 'activa' : 'resuelta'}`}>
                      {a.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════ TAB: REPORTES ═══════════════════════════ */}
        {activeTab === 'reportes' && (
          <div className="fade-in">
            <div className="section-header">
              <h2 className="section-title">Fundamentos de Sistemas Digitales Aplicados</h2>
            </div>

            <div className="reports-grid">
              {/* Tabla de Verdad */}
              <div className="card">
                <div className="report-card-title">
                  <Binary /> Tabla de Verdad: Sensores de Nivel
                </div>
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>S1</th><th>S0</th><th>Rango</th><th>LED</th><th>Mintermino</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['0','0','0% – 25%','rojo','m₀ (S1′·S0′)'],
                        ['0','1','25% – 50%','amarillo','m₁ (S1′·S0)'],
                        ['1','0','50% – 75%','verde','m₂ (S1·S0′)'],
                        ['1','1','75% – 100%','verde','m₃ (S1·S0)'],
                      ].map(([s1, s0, rango, led, term]) => (
                        <tr key={term}>
                          <td>{s1}</td><td>{s0}</td><td>{rango}</td>
                          <td><span className={`led-indicator ${led}`} /> {led.charAt(0).toUpperCase() + led.slice(1)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{term}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Decodificador de Combustible */}
              <div className="card">
                <div className="report-card-title">
                  <Fuel /> Decodificador: Tipos de Combustible (2 bits)
                </div>
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr><th>Código</th><th>Combustible</th><th>Precio (Bs/L)</th></tr>
                    </thead>
                    <tbody>
                      {[
                        ['00','Gasolina Especial','3.74'],
                        ['01','Diesel Oil','3.72'],
                        ['10','Gasolina Premium Ultra','4.79'],
                        ['11','GNV Vehicular','1.66/m³'],
                      ].map(([code, fuel, price]) => (
                        <tr key={code}>
                          <td className="td-binary">{code}</td>
                          <td>{fuel}</td>
                          <td>Bs. {price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mapa de Karnaugh LED Rojo */}
              <KarnaughMap
                title="K-Map: LED Rojo (Crítico — m₀)"
                icon={AlertTriangle}
                activeMinterm={0}
                expression="F = S1′ · S0′ = (S1+S0)′"
                gate="NOR Gate"
                gateColor="var(--accent-rose)"
              />

              {/* Mapa de Karnaugh LED Amarillo */}
              <KarnaughMap
                title="K-Map: LED Amarillo (Bajo — m₁)"
                icon={Zap}
                activeMinterm={1}
                expression="F = S1′ · S0"
                gate="AND + NOT Gate"
                gateColor="var(--accent-amber)"
              />
            </div>

            {/* Desglose de ingresos por combustible */}
            <div className="card" style={{ marginTop: '0.5rem' }}>
              <div className="report-card-title">
                <TrendingUp /> Ingresos por Tipo de Combustible (Aritmética Binaria)
              </div>
              {ventas.length === 0 ? (
                <EmptyState icon={BarChart3} title="Sin datos de ventas" text="Registra ventas para ver el desglose por combustible." />
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Combustible</th>
                        <th>Operaciones</th>
                        <th>Litros Totales</th>
                        <th>Ingresos (Bs)</th>
                        <th>Ingresos (Binario SD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(
                        ventas.reduce((acc, v) => {
                          const key = (v.combustible || 'Desconocido').split('(')[0].trim();
                          if (!acc[key]) acc[key] = { ops: 0, litros: 0, total: 0 };
                          acc[key].ops++;
                          acc[key].litros += v.litros;
                          acc[key].total  += v.total;
                          return acc;
                        }, {})
                      ).map(([combustible, data]) => (
                        <tr key={combustible}>
                          <td>{combustible}</td>
                          <td>{data.ops}</td>
                          <td>{data.litros.toFixed(1)} L</td>
                          <td className="td-money">Bs. {data.total.toFixed(2)}</td>
                          <td className="td-binary">{decimalABinario(data.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ═══════ MODAL: NUEVA VENTA ═══════ */}
      {showVentaModal && (
        <VentaModal
          surtidores={surtidores}
          onClose={() => setShowVentaModal(false)}
          onSubmit={handleRegistrarVenta}
        />
      )}

      {/* ═══════ MODAL: CREAR / EDITAR SURTIDOR ═══════ */}
      {showSurtidorModal && (
        <SurtidorModal
          surtidor={editingSurtidor}
          surtidoresCount={surtidores.length}
          onClose={() => { setShowSurtidorModal(false); setEditingSurtidor(null); }}
          onSubmit={handleGuardarSurtidor}
        />
      )}
    </div>
  );
}
