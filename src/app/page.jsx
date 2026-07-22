'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Fuel,
  BarChart3,
  AlertTriangle,
  PlusCircle,
  Cpu,
  DollarSign,
  TrendingUp,
  Volume2,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Edit3,
  Zap,
  Layers,
  Droplets,
  Activity,
  X,
  FileText,
  Clock,
  Binary
} from 'lucide-react';
import { calcularBinarioNivel, evaluarLogicaAlertas, decimalABinario } from '@/lib/digitalSystems';

// ─── Helper: Get LED class from binary code ───
function getLedClass(codigoBinario) {
  const { ledRojo, ledAmarillo } = evaluarLogicaAlertas(codigoBinario);
  if (ledRojo) return 'rojo';
  if (ledAmarillo) return 'amarillo';
  return 'verde';
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [surtidores, setSurtidores] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Voice & Clipboard
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [copied, setCopied] = useState(false);

  // Modals
  const [showVentaModal, setShowVentaModal] = useState(false);
  const [showSurtidorModal, setShowSurtidorModal] = useState(false);
  const [editingSurtidor, setEditingSurtidor] = useState(null);

  // Venta form
  const [selectedSurtidorId, setSelectedSurtidorId] = useState('');
  const [litrosVenta, setLitrosVenta] = useState('');
  const [precioVenta, setPrecioVenta] = useState('3.74');

  // Surtidor form
  const [numSurtidor, setNumSurtidor] = useState('');
  const [typeCombustible, setTypeCombustible] = useState('Gasolina Especial (Bs 3.74/L)');
  const [capacidadSurtidor, setCapacidadSurtidor] = useState('10000');
  const [nivelLitrosSurtidor, setNivelLitrosSurtidor] = useState('5000');

  // ─── Fetch data ───
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resS, resV, resA] = await Promise.all([
        fetch('/api/surtidores'),
        fetch('/api/ventas'),
        fetch('/api/alertas')
      ]);
      const [dataS, dataV, dataA] = await Promise.all([
        resS.json(), resV.json(), resA.json()
      ]);
      if (Array.isArray(dataS)) setSurtidores(dataS);
      if (Array.isArray(dataV)) setVentas(dataV);
      if (Array.isArray(dataA)) setAlertas(dataA);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Web Speech API ───
  const toggleVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Tu navegador no soporta Web Speech API. Usa Chrome o Edge.');
      return;
    }
    if (isListening) { setIsListening(false); return; }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-BO';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpeechTranscript(transcript);
      setIsListening(false);
      procesarComandoVoz(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const procesarComandoVoz = (cmd) => {
    const t = cmd.toLowerCase();
    if (t.includes('surtidores') || t.includes('tanques')) setActiveTab('surtidores');
    else if (t.includes('ventas') || t.includes('vender')) { setActiveTab('ventas'); setShowVentaModal(true); }
    else if (t.includes('alertas') || t.includes('alarmas')) setActiveTab('alertas');
    else if (t.includes('reportes')) setActiveTab('reportes');
    else if (t.includes('inicio') || t.includes('dashboard')) setActiveTab('dashboard');
  };

  // ─── Clipboard API ───
  const copiarReporteAlPortapapeles = () => {
    const totalIngresos = ventas.reduce((a, v) => a + v.total, 0);
    const alertasActivas = alertas.filter(a => a.estado === 'ACTIVA').length;
    const summary = `╔══════════════════════════════════════╗
║  REPORTE - EL SURTIDOR COCHABAMBINO  ║
╚══════════════════════════════════════╝
  Fecha: ${new Date().toLocaleString('es-BO')}
  Total Ventas: Bs. ${totalIngresos.toFixed(2)} (${ventas.length} ops)
  Surtidores: ${surtidores.length}
  Alertas Activas: ${alertasActivas}
  Binario Total: ${decimalABinario(totalIngresos)}`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ─── Submit venta ───
  const handleRegistrarVenta = async (e) => {
    e.preventDefault();
    if (!selectedSurtidorId || !litrosVenta) return;
    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surtidorId: selectedSurtidorId, litros: litrosVenta, precioPorLitro: precioVenta })
      });
      if (!res.ok) { const err = await res.json(); alert(`Error: ${err.error}`); return; }
      setShowVentaModal(false);
      setLitrosVenta('');
      setSelectedSurtidorId('');
      fetchData();
    } catch (error) { console.error(error); }
  };

  // ─── Submit surtidor ───
  const handleGuardarSurtidor = async (e) => {
    e.preventDefault();
    try {
      const method = editingSurtidor ? 'PUT' : 'POST';
      const body = editingSurtidor
        ? { id: editingSurtidor.id, numero: numSurtidor, combustible: typeCombustible, capacidad: capacidadSurtidor, nivelLitros: nivelLitrosSurtidor }
        : { numero: numSurtidor, combustible: typeCombustible, capacidad: capacidadSurtidor, nivelLitros: nivelLitrosSurtidor };
      const res = await fetch('/api/surtidores', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowSurtidorModal(false);
        setEditingSurtidor(null);
        setNumSurtidor('');
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  // ─── Delete surtidor ───
  const handleDeleteSurtidor = async (id) => {
    if (!confirm('¿Eliminar este surtidor y todas sus ventas/alertas?')) return;
    try {
      const res = await fetch(`/api/surtidores?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) { console.error(error); }
  };

  // ─── KPI Calculations ───
  const totalIngresosDecimal = ventas.reduce((a, v) => a + v.total, 0);
  const totalIngresosBinario = decimalABinario(totalIngresosDecimal);
  const totalLitrosVendidos = ventas.reduce((a, v) => a + v.litros, 0);
  const alertasActivasCount = alertas.filter(a => a.estado === 'ACTIVA').length;
  const surtidoresOperativos = surtidores.filter(s => s.estado === 'OPERATIVO').length;

  // ─── Page titles ───
  const pageTitles = {
    dashboard: 'Dashboard de Control Digital',
    surtidores: 'Monitoreo de Surtidores & Sensores',
    ventas: 'Registro Aritmético de Ventas',
    alertas: 'Circuito de Alertas y Mapas de Karnaugh',
    reportes: 'Reportes & Sistemas Digitales'
  };

  // ─── Loading skeletons ───
  const renderSkeletons = (count = 4) => (
    <div className="surtidores-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card" />
      ))}
    </div>
  );

  return (
    <div className="app-container">
      {/* ═══════ SIDEBAR ═══════ */}
      <aside className="sidebar">
        <div className="brand-header">
          <div className="brand-icon">
            <Cpu />
          </div>
          <div>
            <div className="brand-title">El Surtidor</div>
            <div className="brand-subtitle">Cochabambino SD</div>
          </div>
        </div>

        <nav className="nav-menu">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Dashboard Principal' },
            { id: 'surtidores', icon: Fuel, label: 'Gestión Surtidores' },
            { id: 'ventas', icon: DollarSign, label: 'Registro de Ventas' },
            { id: 'alertas', icon: AlertTriangle, label: 'Panel de Alertas (SD)', badge: alertasActivasCount },
            { id: 'reportes', icon: Layers, label: 'Reportes & Karnaugh' }
          ].map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon />
              <span>{label}</span>
              {badge > 0 && <span className="nav-badge">{badge}</span>}
            </button>
          ))}
        </nav>

        {/* Voice Widget */}
        <div className="voice-widget">
          <div className="voice-header">
            <span className="voice-label">🎤 Web Speech API</span>
            <button
              onClick={toggleVoiceRecognition}
              className={`voice-btn ${isListening ? 'listening' : 'idle'}`}
            >
              <Volume2 />
            </button>
          </div>
          <div className="voice-hint">
            {isListening
              ? '🔴 Escuchando… Di "Ventas", "Surtidores", "Alertas"'
              : 'Clic para comandos de voz'}
          </div>
          {speechTranscript && (
            <div className="voice-transcript">"{speechTranscript}"</div>
          )}
        </div>
      </aside>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div>
            <h1 className="page-title">{pageTitles[activeTab]}</h1>
            <p className="page-subtitle">
              Estación de Servicio "El Surtidor Cochabambino" — Lógica Digital & SQLite
            </p>
          </div>
          <div className="quick-actions">
            <button className="btn btn-secondary" onClick={copiarReporteAlPortapapeles}>
              {copied ? <Check /> : <Copy />}
              <span>{copied ? '¡Copiado!' : 'Clipboard API'}</span>
            </button>
            <button className="btn btn-primary" onClick={() => setShowVentaModal(true)}>
              <PlusCircle />
              <span>Nueva Venta</span>
            </button>
          </div>
        </header>

        {/* ═══ KPI METRICS (always visible) ═══ */}
        <div className="metrics-grid">
          <div className="card metric-card emerald">
            <div className="metric-header">
              <span className="metric-label">Ingresos Totales</span>
              <div className="metric-icon emerald"><DollarSign /></div>
            </div>
            <div className="metric-value">Bs. {totalIngresosDecimal.toFixed(2)}</div>
            <div className="metric-sub success">
              <Binary style={{ width: 14, height: 14 }} />
              <span>{totalIngresosBinario} ₂</span>
            </div>
          </div>

          <div className="card metric-card cyan">
            <div className="metric-header">
              <span className="metric-label">Litros Dispensados</span>
              <div className="metric-icon cyan"><Droplets /></div>
            </div>
            <div className="metric-value">{totalLitrosVendidos.toFixed(0)} L</div>
            <div className="metric-sub">
              <span>{ventas.length} operaciones</span>
            </div>
          </div>

          <div className="card metric-card amber">
            <div className="metric-header">
              <span className="metric-label">Surtidores</span>
              <div className="metric-icon amber"><Zap /></div>
            </div>
            <div className="metric-value">{surtidores.length}</div>
            <div className="metric-sub warning">
              <Activity style={{ width: 14, height: 14 }} />
              <span>{surtidoresOperativos} operativos</span>
            </div>
          </div>

          <div className="card metric-card rose">
            <div className="metric-header">
              <span className="metric-label">Alertas K-Map</span>
              <div className="metric-icon rose"><AlertTriangle /></div>
            </div>
            <div className="metric-value">{alertasActivasCount}</div>
            <div className="metric-sub danger">
              <span>LEDs por compuertas lógicas</span>
            </div>
          </div>
        </div>

        {/* ═══════════ TAB: DASHBOARD ═══════════ */}
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <div className="section-header">
              <h2 className="section-title">
                Estado de Tanques & Sensores Binarios (S1, S0)
              </h2>
              <button className="btn btn-secondary btn-sm" onClick={fetchData}>
                <RefreshCw /> Actualizar
              </button>
            </div>

            {loading ? renderSkeletons() : (
              <>
                <div className="surtidores-grid">
                  {surtidores.map((s) => {
                    const porcentaje = (s.nivelLitros / s.capacidad) * 100;
                    const ledClass = getLedClass(s.codigoBinario);
                    const { ledRojo, ledAmarillo } = evaluarLogicaAlertas(s.codigoBinario);

                    return (
                      <div key={s.id} className={`card surtidor-card status-${ledClass}`}>
                        <div className="surtidor-header">
                          <div className="surtidor-num">
                            <span className={`led-indicator ${ledClass}`} />
                            <span>Surtidor #{s.numero}</span>
                          </div>
                          <span className="fuel-badge">
                            {s.combustible.split('(')[0].trim()}
                          </span>
                        </div>

                        <div className="tank-container">
                          <div className="tank-info">
                            <span>{s.nivelLitros.toLocaleString()}L / {s.capacidad.toLocaleString()}L</span>
                            <span className="tank-percentage">{porcentaje.toFixed(1)}%</span>
                          </div>
                          <div className="tank-bar-outer">
                            <div
                              className={`tank-bar-inner ${ledClass}`}
                              style={{ width: `${Math.min(porcentaje, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="sd-info-box">
                          <div className="sd-row">
                            <span className="sd-label">Sensor (S1,S0):</span>
                            <span className="binary-badge">{s.codigoBinario}</span>
                          </div>
                          <div className="sd-row">
                            <span className="sd-label">Estado:</span>
                            <span style={{
                              color: ledRojo ? 'var(--accent-rose)' : ledAmarillo ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                              fontWeight: 700
                            }}>
                              {ledRojo ? 'CRÍTICO (m₀)' : ledAmarillo ? 'BAJO (m₁)' : 'NORMAL (m₂/m₃)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recent sales table */}
                <div className="card" style={{ marginTop: '0.5rem' }}>
                  <div className="section-header" style={{ marginBottom: '0.85rem' }}>
                    <h3 className="section-title" style={{ fontSize: '1rem' }}>
                      <Clock style={{ width: 18, height: 18, display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                      Últimas Ventas
                    </h3>
                  </div>
                  {ventas.length === 0 ? (
                    <div className="empty-state">
                      <FileText />
                      <div className="empty-state-title">Sin ventas registradas</div>
                      <div className="empty-state-text">Registra tu primera venta con el botón "Nueva Venta"</div>
                    </div>
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
                          {ventas.slice(0, 5).map((v) => (
                            <tr key={v.id}>
                              <td>{new Date(v.fecha).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}</td>
                              <td>#{v.surtidor?.numero || v.surtidorId}</td>
                              <td>{v.combustible.split('(')[0].trim()}</td>
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
              </>
            )}
          </div>
        )}

        {/* ═══════════ TAB: SURTIDORES CRUD ═══════════ */}
        {activeTab === 'surtidores' && (
          <div className="fade-in">
            <div className="section-header">
              <h2 className="section-title">Gestión Integral de Surtidores</h2>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingSurtidor(null);
                  setNumSurtidor(String(surtidores.length + 1));
                  setTypeCombustible('Gasolina Especial (Bs 3.74/L)');
                  setCapacidadSurtidor('10000');
                  setNivelLitrosSurtidor('5000');
                  setShowSurtidorModal(true);
                }}
              >
                <PlusCircle /> Agregar Surtidor
              </button>
            </div>

            {loading ? renderSkeletons() : surtidores.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <Fuel />
                  <div className="empty-state-title">Sin surtidores</div>
                  <div className="empty-state-text">Agrega tu primer surtidor para comenzar</div>
                </div>
              </div>
            ) : (
              <div className="surtidores-grid">
                {surtidores.map((s) => {
                  const porcentaje = (s.nivelLitros / s.capacidad) * 100;
                  const ledClass = getLedClass(s.codigoBinario);

                  return (
                    <div key={s.id} className={`card surtidor-card status-${ledClass}`}>
                      <div className="surtidor-header">
                        <div className="surtidor-num">
                          <span className={`led-indicator ${ledClass}`} />
                          <span>Surtidor #{s.numero}</span>
                        </div>
                        <div className="surtidor-actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setEditingSurtidor(s);
                              setNumSurtidor(String(s.numero));
                              setTypeCombustible(s.combustible);
                              setCapacidadSurtidor(String(s.capacidad));
                              setNivelLitrosSurtidor(String(s.nivelLitros));
                              setShowSurtidorModal(true);
                            }}
                          >
                            <Edit3 />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteSurtidor(s.id)}
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </div>

                      <div className="fuel-type">{s.combustible}</div>

                      <div className="tank-container">
                        <div className="tank-info">
                          <span>{s.nivelLitros.toLocaleString()} / {s.capacidad.toLocaleString()} L</span>
                          <span className="tank-percentage">{porcentaje.toFixed(1)}%</span>
                        </div>
                        <div className="tank-bar-outer">
                          <div
                            className={`tank-bar-inner ${ledClass}`}
                            style={{ width: `${Math.min(porcentaje, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="sd-info-box">
                        <div className="sd-row">
                          <span className="sd-label">Código Binario:</span>
                          <span className="binary-badge">{s.codigoBinario}</span>
                        </div>
                        <div className="sd-row">
                          <span className="sd-label">Estado Digital:</span>
                          <span style={{ color: s.estado === 'OPERATIVO' ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: 600 }}>
                            {s.estado}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ TAB: VENTAS ═══════════ */}
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
                <div className="empty-state">
                  <DollarSign />
                  <div className="empty-state-title">Sin ventas registradas</div>
                  <div className="empty-state-text">Las ventas aparecerán aquí con su conversión binaria</div>
                </div>
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Surtidor</th>
                        <th>Litros</th>
                        <th>Precio/L</th>
                        <th>Total (Bs)</th>
                        <th>Binario (SD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventas.map((v) => (
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

        {/* ═══════════ TAB: ALERTAS ═══════════ */}
        {activeTab === 'alertas' && (
          <div className="fade-in">
            <div className="section-header">
              <h2 className="section-title">
                Monitoreo de Alertas — Compuertas Lógicas & Karnaugh
              </h2>
              <button className="btn btn-secondary btn-sm" onClick={fetchData}>
                <RefreshCw /> Refrescar
              </button>
            </div>

            {alertas.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <Check />
                  <div className="empty-state-title">Sin alertas activas</div>
                  <div className="empty-state-text">Todos los surtidores operan en niveles normales (m₂/m₃)</div>
                </div>
              </div>
            ) : (
              <div className="alert-list">
                {alertas.map((a) => (
                  <div key={a.id} className={`card alert-card ${a.tipo === 'CRITICO' ? 'critico' : 'bajo'}`}>
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

        {/* ═══════════ TAB: REPORTES ═══════════ */}
        {activeTab === 'reportes' && (
          <div className="fade-in">
            <div className="section-header">
              <h2 className="section-title">Fundamentos de Sistemas Digitales Aplicados</h2>
            </div>

            <div className="reports-grid">
              {/* Truth Table */}
              <div className="card">
                <div className="report-card-title">
                  <Binary /> Tabla de Verdad: Sensores de Nivel
                </div>
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>S1</th>
                        <th>S0</th>
                        <th>Rango</th>
                        <th>LED</th>
                        <th>Mintermino</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>0</td><td>0</td>
                        <td>0% – 25%</td>
                        <td><span className="led-indicator rojo" /> Rojo</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>m₀ (S1′·S0′)</td>
                      </tr>
                      <tr>
                        <td>0</td><td>1</td>
                        <td>25% – 50%</td>
                        <td><span className="led-indicator amarillo" /> Amarillo</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>m₁ (S1′·S0)</td>
                      </tr>
                      <tr>
                        <td>1</td><td>0</td>
                        <td>50% – 75%</td>
                        <td><span className="led-indicator verde" /> Verde</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>m₂ (S1·S0′)</td>
                      </tr>
                      <tr>
                        <td>1</td><td>1</td>
                        <td>75% – 100%</td>
                        <td><span className="led-indicator verde" /> Verde</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>m₃ (S1·S0)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Karnaugh Map */}
              <div className="card">
                <div className="report-card-title">
                  <Layers /> Mapa de Karnaugh: LED Rojo (Crítico)
                </div>
                <div className="karnaugh-grid">
                  <div className="karnaugh-cell karnaugh-header">S1\S0</div>
                  <div className="karnaugh-cell karnaugh-header">0</div>
                  <div className="karnaugh-cell karnaugh-header">1</div>
                  <div className="karnaugh-cell karnaugh-header">0</div>
                  <div className="karnaugh-cell active-red">1 (m₀)</div>
                  <div className="karnaugh-cell active-yellow">0</div>
                  <div className="karnaugh-cell karnaugh-header">1</div>
                  <div className="karnaugh-cell active-green">0</div>
                  <div className="karnaugh-cell active-green">0</div>
                </div>
                <div className="sd-info-box" style={{ marginTop: '0.85rem' }}>
                  <div className="sd-row">
                    <span className="sd-label">Expresión Simplificada:</span>
                    <span className="binary-badge">F = S1′ · S0′ = (S1+S0)′</span>
                  </div>
                  <div className="sd-row">
                    <span className="sd-label">Compuerta:</span>
                    <span style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>NOR Gate</span>
                  </div>
                </div>
              </div>

              {/* Karnaugh Map - Yellow */}
              <div className="card">
                <div className="report-card-title">
                  <AlertTriangle /> Mapa de Karnaugh: LED Amarillo (Bajo)
                </div>
                <div className="karnaugh-grid">
                  <div className="karnaugh-cell karnaugh-header">S1\S0</div>
                  <div className="karnaugh-cell karnaugh-header">0</div>
                  <div className="karnaugh-cell karnaugh-header">1</div>
                  <div className="karnaugh-cell karnaugh-header">0</div>
                  <div className="karnaugh-cell active-red">0</div>
                  <div className="karnaugh-cell active-yellow">1 (m₁)</div>
                  <div className="karnaugh-cell karnaugh-header">1</div>
                  <div className="karnaugh-cell active-green">0</div>
                  <div className="karnaugh-cell active-green">0</div>
                </div>
                <div className="sd-info-box" style={{ marginTop: '0.85rem' }}>
                  <div className="sd-row">
                    <span className="sd-label">Expresión Simplificada:</span>
                    <span className="binary-badge">F = S1′ · S0</span>
                  </div>
                  <div className="sd-row">
                    <span className="sd-label">Compuerta:</span>
                    <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>AND + NOT Gate</span>
                  </div>
                </div>
              </div>

              {/* Decodificador de combustible */}
              <div className="card">
                <div className="report-card-title">
                  <Fuel /> Decodificador: Tipos de Combustible
                </div>
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Código (2 bits)</th>
                        <th>Combustible</th>
                        <th>Precio (Bs/L)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="td-binary">00</td>
                        <td>Gasolina Especial</td>
                        <td>Bs. 3.74</td>
                      </tr>
                      <tr>
                        <td className="td-binary">01</td>
                        <td>Diesel Oil</td>
                        <td>Bs. 3.72</td>
                      </tr>
                      <tr>
                        <td className="td-binary">10</td>
                        <td>Gasolina Premium Ultra</td>
                        <td>Bs. 4.79</td>
                      </tr>
                      <tr>
                        <td className="td-binary">11</td>
                        <td>GNV Vehicular</td>
                        <td>Bs. 1.66/m³</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Resumen de ingresos por combustible */}
            <div className="card" style={{ marginTop: '0.5rem' }}>
              <div className="report-card-title">
                <TrendingUp /> Ingresos por Tipo de Combustible
              </div>
              {ventas.length === 0 ? (
                <div className="empty-state">
                  <BarChart3 />
                  <div className="empty-state-title">Sin datos de ventas</div>
                  <div className="empty-state-text">Registra ventas para ver el desglose por combustible</div>
                </div>
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Combustible</th>
                        <th>Operaciones</th>
                        <th>Litros Totales</th>
                        <th>Ingresos (Bs)</th>
                        <th>Ingresos (Binario)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(
                        ventas.reduce((acc, v) => {
                          const key = v.combustible.split('(')[0].trim();
                          if (!acc[key]) acc[key] = { ops: 0, litros: 0, total: 0 };
                          acc[key].ops++;
                          acc[key].litros += v.litros;
                          acc[key].total += v.total;
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
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowVentaModal(false)}>
          <div className="modal-content">
            <div className="modal-title">
              <DollarSign style={{ color: 'var(--accent-emerald)' }} />
              Registrar Nueva Venta
            </div>
            <form onSubmit={handleRegistrarVenta}>
              <div className="form-group">
                <label className="form-label">Seleccionar Surtidor</label>
                <select
                  className="form-control"
                  value={selectedSurtidorId}
                  onChange={(e) => {
                    setSelectedSurtidorId(e.target.value);
                    const s = surtidores.find(x => x.id === Number(e.target.value));
                    if (s) {
                      if (s.combustible.includes('Premium')) setPrecioVenta('4.79');
                      else if (s.combustible.includes('Diesel')) setPrecioVenta('3.72');
                      else if (s.combustible.includes('GNV')) setPrecioVenta('1.66');
                      else setPrecioVenta('3.74');
                    }
                  }}
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

              {litrosVenta && Number(litrosVenta) > 0 && (
                <div className="sd-info-box" style={{ marginBottom: '1rem' }}>
                  <div className="sd-row">
                    <span className="sd-label">Total Estimado:</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      Bs. {(Number(litrosVenta) * Number(precioVenta)).toFixed(2)}
                    </span>
                  </div>
                  <div className="sd-row">
                    <span className="sd-label">Aritmética Binaria:</span>
                    <span className="binary-badge">
                      {decimalABinario(Number(litrosVenta) * Number(precioVenta))} ₂
                    </span>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowVentaModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check /> Procesar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ MODAL: NUEVO/EDITAR SURTIDOR ═══════ */}
      {showSurtidorModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowSurtidorModal(false)}>
          <div className="modal-content">
            <div className="modal-title">
              <Fuel style={{ color: 'var(--accent-cyan)' }} />
              {editingSurtidor ? 'Editar Surtidor' : 'Agregar Nuevo Surtidor'}
            </div>
            <form onSubmit={handleGuardarSurtidor}>
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
                  <option value="Gasolina Especial (Bs 3.74/L)">Gasolina Especial (Bs 3.74/L)</option>
                  <option value="Diesel Oil (Bs 3.72/L)">Diesel Oil (Bs 3.72/L)</option>
                  <option value="Gasolina Premium Ultra (Bs 4.79/L)">Gasolina Premium Ultra (Bs 4.79/L)</option>
                  <option value="GNV Vehicular (Bs 1.66/m3)">GNV Vehicular (Bs 1.66/m³)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Capacidad Máxima (Litros)</label>
                <input
                  type="number" min="1"
                  className="form-control"
                  value={capacidadSurtidor}
                  onChange={(e) => setCapacidadSurtidor(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nivel Actual (Litros)</label>
                <input
                  type="number" min="0"
                  className="form-control"
                  value={nivelLitrosSurtidor}
                  onChange={(e) => setNivelLitrosSurtidor(e.target.value)}
                  required
                />
              </div>

              {capacidadSurtidor && nivelLitrosSurtidor && (
                <div className="sd-info-box" style={{ marginBottom: '1rem' }}>
                  <div className="sd-row">
                    <span className="sd-label">Nivel Previsto:</span>
                    <span className="tank-percentage">
                      {((Number(nivelLitrosSurtidor) / Number(capacidadSurtidor)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="sd-row">
                    <span className="sd-label">Código Binario:</span>
                    <span className="binary-badge">
                      {calcularBinarioNivel((Number(nivelLitrosSurtidor) / Number(capacidadSurtidor)) * 100).code}
                    </span>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSurtidorModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check /> {editingSurtidor ? 'Actualizar' : 'Crear Surtidor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
