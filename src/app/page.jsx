'use client';

import { useState, useEffect } from 'react';
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
  Layers 
} from 'lucide-react';
import { calcularBinarioNivel, evaluarLogicaAlertas, decimalABinario } from '@/lib/digitalSystems';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [surtidores, setSurtidores] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Voice & Clipboard States
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [copied, setCopied] = useState(false);

  // Modals & Form states
  const [showVentaModal, setShowVentaModal] = useState(false);
  const [showSurtidorModal, setShowSurtidorModal] = useState(false);
  const [editingSurtidor, setEditingSurtidor] = useState(null);

  // New Venta Form
  const [selectedSurtidorId, setSelectedSurtidorId] = useState('');
  const [litrosVenta, setLitrosVenta] = useState('');
  const [precioVenta, setPrecioVenta] = useState('3.74'); // Default Bs Gasoline

  // New Surtidor Form
  const [numSurtidor, setNumSurtidor] = useState('');
  const [typeCombustible, setTypeCombustible] = useState('Gasolina Especial (Bs 3.74/L)');
  const [capacidadSurtidor, setCapacidadSurtidor] = useState('10000');
  const [nivelLitrosSurtidor, setNivelLitrosSurtidor] = useState('5000');

  // Load Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resS, resV, resA] = await Promise.all([
        fetch('/api/surtidores'),
        fetch('/api/ventas'),
        fetch('/api/alertas')
      ]);

      const dataS = await resS.json();
      const dataV = await resV.json();
      const dataA = await resA.json();

      if (Array.isArray(dataS)) setSurtidores(dataS);
      if (Array.isArray(dataV)) setVentas(dataV);
      if (Array.isArray(dataA)) setAlertas(dataA);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Web Speech API handler
  const toggleVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Tu navegador no soporta Web Speech API. Intenta con Google Chrome o Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-BO';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpeechTranscript(transcript);
      setIsListening(false);
      procesarComandoVoz(transcript);
    };

    recognition.onerror = (error) => {
      console.error('Error de voz:', error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const procesarComandoVoz = (cmd) => {
    const text = cmd.toLowerCase();
    if (text.includes('surtidores') || text.includes('tanques')) {
      setActiveTab('surtidores');
    } else if (text.includes('ventas') || text.includes('vender')) {
      setActiveTab('ventas');
      setShowVentaModal(true);
    } else if (text.includes('alertas') || text.includes('alarmas')) {
      setActiveTab('alertas');
    } else if (text.includes('reportes')) {
      setActiveTab('reportes');
    } else if (text.includes('inicio') || text.includes('dashboard')) {
      setActiveTab('dashboard');
    } else {
      alert(`Comando de voz reconocido: "${cmd}"`);
    }
  };

  // Clipboard API handler
  const copiarReporteAlPortapapeles = () => {
    const totalIngresos = ventas.reduce((acc, v) => acc + v.total, 0);
    const alertasActivas = alertas.filter(a => a.estado === 'ACTIVA').length;
    const summary = `--- REPORTE EL SURTIDOR COCHABAMBINO ---
Fecha: ${new Date().toLocaleString('es-BO')}
Total Ventas: Bs. ${totalIngresos.toFixed(2)} (${ventas.length} transacciones)
Surtidores Registrados: ${surtidores.length}
Alertas Activas (K-Map): ${alertasActivas}
Representación Binaria Total: ${decimalABinario(totalIngresos)} bin`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Submit Venta
  const handleRegistrarVenta = async (e) => {
    e.preventDefault();
    if (!selectedSurtidorId || !litrosVenta) return;

    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surtidorId: selectedSurtidorId,
          litros: litrosVenta,
          precioPorLitro: precioVenta
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error}`);
        return;
      }

      setShowVentaModal(false);
      setLitrosVenta('');
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  // Submit Surtidor
  const handleGuardarSurtidor = async (e) => {
    e.preventDefault();
    try {
      const url = '/api/surtidores';
      const method = editingSurtidor ? 'PUT' : 'POST';
      const body = editingSurtidor 
        ? { id: editingSurtidor.id, numero: numSurtidor, combustible: typeCombustible, capacidad: capacidadSurtidor, nivelLitros: nivelLitrosSurtidor }
        : { numero: numSurtidor, combustible: typeCombustible, capacidad: capacidadSurtidor, nivelLitros: nivelLitrosSurtidor };

      const res = await fetch(url, {
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
    } catch (error) {
      console.error(error);
    }
  };

  // Delete Surtidor
  const handleDeleteSurtidor = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este surtidor?')) return;
    try {
      const res = await fetch(`/api/surtidores?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  // Calculations for KPI Cards
  const totalIngresosDecimal = ventas.reduce((acc, v) => acc + v.total, 0);
  const totalIngresosBinario = decimalABinario(totalIngresosDecimal);
  const totalLitrosVendidos = ventas.reduce((acc, v) => acc + v.litros, 0);
  const alertasActivasCount = alertas.filter(a => a.estado === 'ACTIVA').length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-header">
          <div className="brand-icon">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="brand-title">El Surtidor</div>
            <div className="brand-subtitle">Cochabambino SD</div>
          </div>
        </div>

        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Dashboard Principal</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'surtidores' ? 'active' : ''}`}
            onClick={() => setActiveTab('surtidores')}
          >
            <Fuel className="w-5 h-5" />
            <span>Gestión Surtidores</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'ventas' ? 'active' : ''}`}
            onClick={() => setActiveTab('ventas')}
          >
            <DollarSign className="w-5 h-5" />
            <span>Registro de Ventas</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'alertas' ? 'active' : ''}`}
            onClick={() => setActiveTab('alertas')}
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Panel de Alertas (SD)</span>
            {alertasActivasCount > 0 && (
              <span className="nav-badge">{alertasActivasCount}</span>
            )}
          </button>

          <button 
            className={`nav-item ${activeTab === 'reportes' ? 'active' : ''}`}
            onClick={() => setActiveTab('reportes')}
          >
            <Layers className="w-5 h-5" />
            <span>Reportes & Karnaugh</span>
          </button>
        </nav>

        {/* Voice Control Widget in Sidebar */}
        <div className="sd-info-box" style={{ marginTop: 'auto', background: 'rgba(6, 182, 212, 0.08)' }}>
          <div className="sd-row">
            <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>Control por Voz API</span>
            <button 
              onClick={toggleVoiceRecognition}
              style={{
                background: isListening ? 'var(--accent-rose)' : 'var(--accent-cyan)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                align-items: 'center',
                justify-content: 'center',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            {isListening ? 'Escuchando... Di "Ventas", "Surtidores", "Alertas"' : 'Haz clic en el micro para hablar'}
          </div>
          {speechTranscript && (
            <div style={{ fontSize: '0.7rem', color: '#fff', fontStyle: 'italic', marginTop: '0.2rem' }}>
              "{speechTranscript}"
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-bar">
          <div>
            <h1 className="page-title">
              {activeTab === 'dashboard' && 'Dashboard de Control Digital'}
              {activeTab === 'surtidores' && 'Monitoreo de Surtidores & Sensores'}
              {activeTab === 'ventas' && 'Registro Aritmético de Ventas'}
              {activeTab === 'alertas' && 'Circuito de Alertas y Mapas de Karnaugh'}
              {activeTab === 'reportes' && 'Reportes Integrados y Decodificadores'}
            </h1>
            <p className="page-subtitle">Estación de Servicio "El Surtidor Cochabambino" - Lógica Digital & BD SQLite</p>
          </div>

          <div className="quick-actions">
            <button className="btn btn-secondary" onClick={copiarReporteAlPortapapeles}>
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Reporte (Clipboard API)'}</span>
            </button>

            <button className="btn btn-primary" onClick={() => setShowVentaModal(true)}>
              <PlusCircle className="w-4 h-4" />
              <span>Nueva Venta</span>
            </button>
          </div>
        </header>

        {/* METRICS ROW */}
        <div className="metrics-grid">
          <div className="card">
            <div className="metric-header">
              <span>Ingresos Totales (Decimal)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="metric-value">Bs. {totalIngresosDecimal.toFixed(2)}</div>
            <div className="metric-sub success">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Aritmética Binaria: {totalIngresosBinario} (2)</span>
            </div>
          </div>

          <div className="card">
            <div className="metric-header">
              <span>Litros Dispensados</span>
              <Fuel className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="metric-value">{totalLitrosVendidos.toFixed(0)} L</div>
            <div className="metric-sub">
              <span>En {ventas.length} operaciones registradas</span>
            </div>
          </div>

          <div className="card">
            <div className="metric-header">
              <span>Surtidores Activos</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="metric-value">{surtidores.length}</div>
            <div className="metric-sub warning">
              <span>{surtidores.filter(s => s.estado === 'OPERATIVO').length} Operativos normales</span>
            </div>
          </div>

          <div className="card">
            <div className="metric-header">
              <span>Alertas K-Map Activas</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="metric-value">{alertasActivasCount}</div>
            <div className="metric-sub danger">
              <span>LEDs Activados por Compuertas Lógicas</span>
            </div>
          </div>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Estado de Tanques & Sensores Binarios (00, 01, 10, 11)</h2>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={fetchData}>
                <RefreshCw className="w-3.5 h-3.5" /> Actualizar
              </button>
            </div>

            <div className="surtidores-grid">
              {surtidores.map((s) => {
                const porcentaje = (s.nivelLitros / s.capacidad) * 100;
                const { ledRojo, ledAmarillo } = evaluarLogicaAlertas(s.codigoBinario);
                let ledClass = 'verde';
                if (ledRojo) ledClass = 'rojo';
                else if (ledAmarillo) ledClass = 'amarillo';

                return (
                  <div key={s.id} className="card surtidor-card">
                    <div className="surtidor-header">
                      <div className="surtidor-num">
                        <span className={`led-indicator ${ledClass}`}></span>
                        <span>Surtidor #{s.numero}</span>
                      </div>
                      <span className="fuel-badge">{s.combustible.split('(')[0]}</span>
                    </div>

                    <div className="tank-container">
                      <div className="tank-info">
                        <span>Capacidad: {s.nivelLitros}L / {s.capacidad}L</span>
                        <span style={{ fontWeight: 700 }}>{porcentaje.toFixed(1)}%</span>
                      </div>
                      <div className="tank-bar-outer">
                        <div 
                          className={`tank-bar-inner ${ledClass}`} 
                          style={{ width: `${porcentaje}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="sd-info-box">
                      <div className="sd-row">
                        <span>Código Binario Sensor (S1,S0):</span>
                        <span className="binary-badge">[{s.codigoBinario}]</span>
                      </div>
                      <div className="sd-row">
                        <span>Estado Lógico:</span>
                        <span style={{ 
                          color: ledRojo ? 'var(--accent-rose)' : ledAmarillo ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                          fontWeight: 700 
                        }}>
                          {ledRojo ? '100% CRÍTICO (m0)' : ledAmarillo ? 'ALERTA BAJO (m1)' : 'NORMAL (m2/m3)'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ultimas Ventas Table */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Últimas Ventas Registradas</h3>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Surtidor</th>
                      <th>Combustible</th>
                      <th>Litros</th>
                      <th>Total (Decimal)</th>
                      <th>Total (Binario - SD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.slice(0, 5).map((v) => (
                      <tr key={v.id}>
                        <td>{new Date(v.fecha).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>Surtidor #{v.surtidor?.numero || v.surtidorId}</td>
                        <td>{v.combustible}</td>
                        <td>{v.litros} L</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>Bs. {v.total.toFixed(2)}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{v.totalBinario}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SURTIDORES CRUD */}
        {activeTab === 'surtidores' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Gestión Integral de Surtidores</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingSurtidor(null);
                  setNumSurtidor(surtidores.length + 1);
                  setShowSurtidorModal(true);
                }}
              >
                <PlusCircle className="w-4 h-4" /> Agregar Nuevo Surtidor
              </button>
            </div>

            <div className="surtidores-grid">
              {surtidores.map((s) => {
                const porcentaje = (s.nivelLitros / s.capacidad) * 100;
                return (
                  <div key={s.id} className="card">
                    <div className="surtidor-header">
                      <div className="surtidor-num">
                        <span>Surtidor #{s.numero}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.3rem 0.5rem' }}
                          onClick={() => {
                            setEditingSurtidor(s);
                            setNumSurtidor(s.numero);
                            setTypeCombustible(s.combustible);
                            setCapacidadSurtidor(s.capacidad);
                            setNivelLitrosSurtidor(s.nivelLitros);
                            setShowSurtidorModal(true);
                          }}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.3rem 0.5rem', color: 'var(--accent-rose)' }}
                          onClick={() => handleDeleteSurtidor(s.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {s.combustible}
                    </div>

                    <div className="tank-container">
                      <div className="tank-info">
                        <span>Nivel: {s.nivelLitros} / {s.capacidad} Litros</span>
                        <span>{porcentaje.toFixed(1)}%</span>
                      </div>
                      <div className="tank-bar-outer">
                        <div 
                          className="tank-bar-inner verde" 
                          style={{ width: `${porcentaje}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="sd-info-box">
                      <div className="sd-row">
                        <span>Mintermino Karnaugh:</span>
                        <span className="binary-badge">Code: {s.codigoBinario}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: VENTAS */}
        {activeTab === 'ventas' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Histórico de Ventas & Aritmética Binaria</h2>
              <button className="btn btn-primary" onClick={() => setShowVentaModal(true)}>
                <PlusCircle className="w-4 h-4" /> Registrar Nueva Venta
              </button>
            </div>

            <div className="card">
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
                      <th>Conversión Binaria (SD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map((v) => (
                      <tr key={v.id}>
                        <td>#{v.id}</td>
                        <td>{new Date(v.fecha).toLocaleString('es-BO')}</td>
                        <td>Surtidor #{v.surtidor?.numero || v.surtidorId}</td>
                        <td>{v.litros} L</td>
                        <td>Bs. {v.precioPorLitro.toFixed(2)}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>Bs. {v.total.toFixed(2)}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{v.totalBinario}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ALERTAS */}
        {activeTab === 'alertas' && (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Monitoreo de Alertas Lógicas (Compuertas & Mapas de Karnaugh)
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {alertas.map((a) => (
                <div 
                  key={a.id} 
                  className="card" 
                  style={{ 
                    borderLeft: `4px solid ${a.tipo === 'CRITICO' ? 'var(--accent-rose)' : 'var(--accent-amber)'}`,
                    display: 'flex',
                    justify-content: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span className={`led-indicator ${a.tipo === 'CRITICO' ? 'rojo' : 'amarillo'}`}></span>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: a.tipo === 'CRITICO' ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                        ALERTA {a.tipo}: Surtidor #{a.surtidor?.numero || a.surtidorId}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(a.fecha).toLocaleString('es-BO')}
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{a.mensaje}</p>

                    <div className="sd-info-box" style={{ margin: 0, display: 'inline-block' }}>
                      <span>Expresión Booleana K-Map: </span>
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{a.logicaKarnaugh}</span>
                    </div>
                  </div>

                  <div>
                    <span className="fuel-badge" style={{ background: a.estado === 'ACTIVA' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: a.estado === 'ACTIVA' ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                      {a.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: REPORTES */}
        {activeTab === 'reportes' && (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Reportes Generales y Fundamentos de Sistemas Digitales
            </h2>

            <div className="metrics-grid">
              <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
                  Tabla de Verdad: Sensores de Nivel (S1, S0)
                </h3>
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>S1</th>
                        <th>S0</th>
                        <th>Rango %</th>
                        <th>LED Activo</th>
                        <th>Mintermino</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>0</td>
                        <td>0</td>
                        <td>0% - 25%</td>
                        <td><span className="led-indicator rojo"></span> Rojo (Crítico)</td>
                        <td>m0 (S1' · S0')</td>
                      </tr>
                      <tr>
                        <td>0</td>
                        <td>1</td>
                        <td>25% - 50%</td>
                        <td><span className="led-indicator amarillo"></span> Amarillo (Bajo)</td>
                        <td>m1 (S1' · S0)</td>
                      </tr>
                      <tr>
                        <td>1</td>
                        <td>0</td>
                        <td>50% - 75%</td>
                        <td><span className="led-indicator verde"></span> Verde (Medio)</td>
                        <td>m2 (S1 · S0')</td>
                      </tr>
                      <tr>
                        <td>1</td>
                        <td>1</td>
                        <td>75% - 100%</td>
                        <td><span className="led-indicator verde"></span> Verde (Lleno)</td>
                        <td>m3 (S1 · S0)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL NUEVA VENTA */}
      {showVentaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Registrar Nueva Venta</h2>
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
                  <option value="">-- Seleccionar --</option>
                  {surtidores.map(s => (
                    <option key={s.id} value={s.id}>
                      Surtidor #{s.numero} - {s.combustible.split('(')[0]} (Disp: {s.nivelLitros}L)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Litros a Despachar</label>
                <input 
                  type="number" 
                  step="0.1" 
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
                  type="number" 
                  step="0.01" 
                  className="form-control"
                  value={precioVenta}
                  onChange={(e) => setPrecioVenta(e.target.value)}
                  required
                />
              </div>

              {litrosVenta && (
                <div className="sd-info-box" style={{ marginBottom: '1.2rem' }}>
                  <div className="sd-row">
                    <span>Total Estimado:</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      Bs. {(Number(litrosVenta) * Number(precioVenta)).toFixed(2)}
                    </span>
                  </div>
                  <div className="sd-row">
                    <span>Conversión Aritmética Binaria:</span>
                    <span className="binary-badge">
                      {decimalABinario(Number(litrosVenta) * Number(precioVenta))} (2)
                    </span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowVentaModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Procesar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVO/EDITAR SURTIDOR */}
      {showSurtidorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
              {editingSurtidor ? 'Editar Surtidor' : 'Agregar Nuevo Surtidor'}
            </h2>
            <form onSubmit={handleGuardarSurtidor}>
              <div className="form-group">
                <label className="form-label">Número de Surtidor</label>
                <input 
                  type="number" 
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
                  <option value="GNV Vehicular (Bs 1.66/m3)">GNV Vehicular (Bs 1.66/m3)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Capacidad Máxima (Litros)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={capacidadSurtidor}
                  onChange={(e) => setCapacidadSurtidor(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nivel Actual (Litros)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={nivelLitrosSurtidor}
                  onChange={(e) => setNivelLitrosSurtidor(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowSurtidorModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
