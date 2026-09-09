import { useState, useEffect } from 'react';
import './fleetcare.css';

// ============================================================
// FleetCare – Sistema Web para Gestión y Mantenimiento Predictivo
// ============================================================

// --- TIPOS DE DATOS ---
// Object: Representa la entidad Vehículo
interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  kilometraje: number;
  tipo: string;
  fechaRegistro: string;
}

// Object: Representa la entidad Mantenimiento
interface Mantenimiento {
  id: number;
  vehiculoId: number;
  tipo: string;
  fecha: string;
  kilometraje: number;
  costo: number;
  descripcion: string;
}

// Array: Lista de vehículos registrados
type Vehiculos = Vehiculo[];
type Mantenimientos = Mantenimiento[];

// Constantes para configuración del sistema
const INTERVALO_MANTENIMIENTO_KM = 10000; // Cada 10,000 km
const INTERVALO_MANTENIMIENTO_MESES = 6; // Cada 6 meses
const COSTO_BASE_MANTENIMIENTO = 350; // Costo base en soles

// --- EXPRESIÓN REGULAR ---
// Valida placa vehicular peruana: formato actual (ABC-123) o antiguo (AB-1234)
// [A-Z]{3}-\d{3} = Placa nueva (3 letras + guión + 3 dígitos)
// [A-Z]{2}-\d{4} = Placa antigua (2 letras + guión + 4 dígitos)
const REGEX_PLACA_PERUANA = /^[A-Z]{3}-\d{3}$|^[A-Z]{2}-\d{4}$/;

// Función auxiliar para validar placa
function validarPlaca(placa: string): boolean {
  // .trim() elimina espacios al inicio y final
  // .toUpperCase() convierte a mayúsculas para validar
  const placaLimpia = placa.trim().toUpperCase();
  return REGEX_PLACA_PERUANA.test(placaLimpia);
}

// --- FUNCIONES PROPIAS ---

// 1. Calcular próximo mantenimiento por kilometraje
function calcularProximoMantenimientoKm(kilometrajeActual: number): number {
  // Math.ceil: Redondea hacia arriba para obtener el siguiente intervalo
  // Operación matemática: división + multiplicación
  return Math.ceil(kilometrajeActual / INTERVALO_MANTENIMIENTO_KM) * INTERVALO_MANTENIMIENTO_KM;
}

// 2. Calcular kilómetros faltantes para próximo mantenimiento
function calcularKmFaltantes(kilometrajeActual: number): number {
  const proximo = calcularProximoMantenimientoKm(kilometrajeActual);
  return proximo - kilometrajeActual;
}

// 3. Calcular costo estimado del próximo mantenimiento
function calcularCostoEstimado(kilometrajeActual: number, anio: number): number {
  // Operación matemática: costo base + factor por antigüedad
  const edadVehiculo = 2026 - anio;
  const factorEdad = 1 + (edadVehiculo * 0.05); // 5% más por cada año
  // Math.round: Redondea al entero más cercano
  return Math.round(COSTO_BASE_MANTENIMIENTO * factorEdad);
}

// 4. Calcular promedio de costos de mantenimiento
function calcularPromedioCostos(costos: number[]): number {
  if (costos.length === 0) return 0;
  // Operación matemática: suma total / cantidad
  const sumaTotal = costos.reduce((acc, costo) => acc + costo, 0);
  // Math.floor: Redondea hacia abajo para mostrar un valor conservador
  return Math.floor(sumaTotal / costos.length);
}

// 5. Determinar nivel de alerta del vehículo
function determinarAlerta(kmFaltantes: number, mesesSinMantenimiento: number): string {
  // Operadores de comparación: >, <, >=, <=
  // Operadores lógicos: &&, ||
  if (kmFaltantes <= 500 || mesesSinMantenimiento >= INTERVALO_MANTENIMIENTO_MESES) {
    return 'critico';
  } else if (kmFaltantes <= 2000 || mesesSinMantenimiento >= 4) {
    return 'advertencia';
  } else {
    return 'ok';
  }
}

// 6. Formatear moneda
function formatearMoneda(monto: number): string {
  // Template literal: interpolación de variables
  return `S/ ${monto.toLocaleString('es-PE')}`;
}

// 7. Formatear fecha
function formatearFecha(fecha: string): string {
  // Métodos de string: slice, replace
  const partes = fecha.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return fecha;
}

// 8. Calcular meses transcurridos desde última fecha
function mesesTranscurridos(fechaStr: string): number {
  const fecha = new Date(fechaStr);
  const hoy = new Date();
  // Math.max: Asegura que no sea negativo
  return Math.max(0, (hoy.getFullYear() - fecha.getFullYear()) * 12 + (hoy.getMonth() - fecha.getMonth()));
}

// 9. Generar ID único
let idCounter = 1;
function generarId(): number {
  // Math.random: Genera un número aleatorio como semilla adicional
  const random = Math.floor(Math.random() * 1000);
  return idCounter++ + random;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function App() {
  // --- ESTADO (Variables reactivas) ---
  const [vehiculos, setVehiculos] = useState<Vehiculos>([]);
  const [mantenimientos, setMantenimientos] = useState<Mantenimientos>([]);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: string } | null>(null);
  const [seccionActiva, setSeccionActiva] = useState<string>('dashboard');

  // Estado del formulario de vehículos
  const [formVehiculo, setFormVehiculo] = useState({
    placa: '',
    marca: '',
    modelo: '',
    anio: '',
    kilometraje: '',
    tipo: 'camioneta'
  });

  // Estado del formulario de mantenimiento
  const [formMantenimiento, setFormMantenimiento] = useState({
    vehiculoId: '',
    tipo: 'preventivo',
    fecha: '',
    kilometraje: '',
    costo: '',
    descripcion: ''
  });

  // --- EFECTO: Cargar datos del localStorage ---
  useEffect(() => {
    try {
      const vehiculosGuardados = localStorage.getItem('fleetcare_vehiculos');
      const mantenimientosGuardados = localStorage.getItem('fleetcare_mantenimientos');
      if (vehiculosGuardados) setVehiculos(JSON.parse(vehiculosGuardados));
      if (mantenimientosGuardados) setMantenimientos(JSON.parse(mantenimientosGuardados));
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  }, []);

  // --- EFECTO: Guardar datos en localStorage ---
  useEffect(() => {
    try {
      localStorage.setItem('fleetcare_vehiculos', JSON.stringify(vehiculos));
      localStorage.setItem('fleetcare_mantenimientos', JSON.stringify(mantenimientos));
    } catch (error) {
      console.error('Error al guardar datos:', error);
    }
  }, [vehiculos, mantenimientos]);

  // --- FUNCIÓN: Mostrar mensaje ---
  function mostrarMensaje(texto: string, tipo: string) {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  }

  // --- FUNCIÓN: Registrar vehículo ---
  function registrarVehiculo(e: React.FormEvent) {
    e.preventDefault();

    // --- VALIDACIÓN DE DATOS ---
    // Método de string: .trim() - elimina espacios
    const placa = formVehiculo.placa.trim().toUpperCase();
    const marca = formVehiculo.marca.trim();
    const modelo = formVehiculo.modelo.trim();
    const anio = parseInt(formVehiculo.anio);
    const kilometraje = parseInt(formVehiculo.kilometraje);
    const tipo = formVehiculo.tipo;

    // Validaciones con operadores de comparación
    if (!placa || !marca || !modelo || !anio || isNaN(kilometraje)) {
      mostrarMensaje('⚠️ Todos los campos son obligatorios.', 'error');
      return;
    }

    // Validar placa con regex
    if (!validarPlaca(placa)) {
      mostrarMensaje('⚠️ Placa inválida. Formato: ABC-123 o AB-1234', 'error');
      return;
    }

    // Validar año
    if (anio < 1990 || anio > 2026) {
      mostrarMensaje('⚠️ El año debe estar entre 1990 y 2026.', 'error');
      return;
    }

    // Validar kilometraje
    if (kilometraje < 0 || kilometraje > 999999) {
      mostrarMensaje('⚠️ Kilometraje inválido (0 - 999,999 km).', 'error');
      return;
    }

    // Verificar si la placa ya existe
    // Método de string: .includes() - verifica si contiene un valor
    const placaExiste = vehiculos.some(v => v.placa.includes(placa));
    if (placaExiste) {
      mostrarMensaje('⚠️ Ya existe un vehículo con esa placa.', 'error');
      return;
    }

    // Crear nuevo vehículo usando Spread operator
    // Spread (...): Copia todas las propiedades del objeto existente y agrega/modifica las nuevas
    const nuevoVehiculo: Vehiculo = {
      id: generarId(),
      placa,
      marca: marca.charAt(0).toUpperCase() + marca.slice(1).toLowerCase(), // Métodos de string: charAt, slice, toLowerCase
      modelo: modelo.charAt(0).toUpperCase() + modelo.slice(1).toLowerCase(),
      anio,
      kilometraje,
      tipo,
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    // Spread operator para agregar al array: crea un nuevo array con el elemento nuevo
    setVehiculos([...vehiculos, nuevoVehiculo]);
    mostrarMensaje(`✅ Vehículo ${placa} registrado exitosamente.`, 'exito');

    // Limpiar formulario
    setFormVehiculo({ placa: '', marca: '', modelo: '', anio: '', kilometraje: '', tipo: 'camioneta' });
  }

  // --- FUNCIÓN: Registrar mantenimiento ---
  function registrarMantenimiento(e: React.FormEvent) {
    e.preventDefault();

    const vehiculoId = parseInt(formMantenimiento.vehiculoId);
    const tipo = formMantenimiento.tipo;
    const fecha = formMantenimiento.fecha;
    const kilometraje = parseInt(formMantenimiento.kilometraje);
    const costo = parseFloat(formMantenimiento.costo);
    const descripcion = formMantenimiento.descripcion.trim();

    // Validaciones
    if (!vehiculoId || !fecha || isNaN(kilometraje) || isNaN(costo)) {
      mostrarMensaje('⚠️ Complete todos los campos obligatorios.', 'error');
      return;
    }

    if (costo < 0) {
      mostrarMensaje('⚠️ El costo no puede ser negativo.', 'error');
      return;
    }

    // Validar que el vehículo existe
    const vehiculo = vehiculos.find(v => v.id === vehiculoId);
    if (!vehiculo) {
      mostrarMensaje('⚠️ Vehículo no encontrado.', 'error');
      return;
    }

    // Método de string: .length - verifica longitud
    if (descripcion.length < 5) {
      mostrarMensaje('⚠️ La descripción debe tener al menos 5 caracteres.', 'error');
      return;
    }

    // Crear nuevo mantenimiento usando Spread
    const nuevoMantenimiento: Mantenimiento = {
      id: generarId(),
      vehiculoId,
      tipo,
      fecha,
      kilometraje,
      costo,
      descripcion
    };

    // Spread operator: agrega al array de mantenimientos
    setMantenimientos([...mantenimientos, nuevoMantenimiento]);

    // Actualizar kilometraje del vehículo
    // Spread operator: actualiza el vehículo con nuevo kilometraje
    setVehiculos(vehiculos.map(v =>
      v.id === vehiculoId
        ? { ...v, kilometraje: Math.max(v.kilometraje, kilometraje) } // Math.max: toma el mayor valor
        : v
    ));

    mostrarMensaje(`✅ Mantenimiento registrado para ${vehiculo.placa}.`, 'exito');
    setFormMantenimiento({ vehiculoId: '', tipo: 'preventivo', fecha: '', kilometraje: '', costo: '', descripcion: '' });
  }

  // --- FUNCIÓN: Eliminar vehículo ---
  function eliminarVehiculo(id: number) {
    // Spread + filter: crea nuevo array sin el vehículo eliminado
    setVehiculos(vehiculos.filter(v => v.id !== id));
    setMantenimientos(mantenimientos.filter(m => m.vehiculoId !== id));
    mostrarMensaje('🗑️ Vehículo eliminado correctamente.', 'info');
  }

  // --- CÁLCULOS DERIVADOS ---
  // Costos totales
  const costoTotal = mantenimientos.reduce((acc, m) => acc + m.costo, 0);
  const costosArray = mantenimientos.map(m => m.costo);
  const costoPromedio = calcularPromedioCostos(costosArray);
  // Math.max: Obtiene el costo máximo
  const costoMaximo = costosArray.length > 0 ? Math.max(...costosArray) : 0;
  // Math.min: Obtiene el costo mínimo
  const costoMinimo = costosArray.length > 0 ? Math.min(...costosArray) : 0;

  // Alertas de mantenimiento
  const alertas = vehiculos.map(v => {
    const mantVehiculo = mantenimientos
      .filter(m => m.vehiculoId === v.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    const ultimoMant = mantVehiculo[0];
    const mesesSinMant = ultimoMant ? mesesTranscurridos(ultimoMant.fecha) : mesesTranscurridos(v.fechaRegistro);
    const kmFaltantes = calcularKmFaltantes(v.kilometraje);
    const nivel = determinarAlerta(kmFaltantes, mesesSinMant);

    return {
      vehiculo: v,
      kmFaltantes,
      mesesSinMant,
      nivel,
      proximoKm: calcularProximoMantenimientoKm(v.kilometraje),
      costoEstimado: calcularCostoEstimado(v.kilometraje, v.anio)
    };
  });

  const alertasCriticas = alertas.filter(a => a.nivel === 'critico');
  const alertasAdvertencia = alertas.filter(a => a.nivel === 'advertencia');

  // ============================================================
  // RENDERIZADO
  // ============================================================
  return (
    <div className="fleetcare-app">
      {/* HEADER / NAVEGACIÓN */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🚛</span>
            <div>
              <h1 className="logo-title">FleetCare</h1>
              <p className="logo-subtitle">Gestión y Mantenimiento Predictivo</p>
            </div>
          </div>
          <nav className="nav">
            <button
              className={`nav-btn ${seccionActiva === 'dashboard' ? 'active' : ''}`}
              onClick={() => setSeccionActiva('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`nav-btn ${seccionActiva === 'vehiculos' ? 'active' : ''}`}
              onClick={() => setSeccionActiva('vehiculos')}
            >
              🚗 Vehículos
            </button>
            <button
              className={`nav-btn ${seccionActiva === 'mantenimiento' ? 'active' : ''}`}
              onClick={() => setSeccionActiva('mantenimiento')}
            >
              🔧 Mantenimiento
            </button>
            <button
              className={`nav-btn ${seccionActiva === 'alertas' ? 'active' : ''}`}
              onClick={() => setSeccionActiva('alertas')}
            >
              ⚠️ Alertas
            </button>
            <button
              className={`nav-btn ${seccionActiva === 'costos' ? 'active' : ''}`}
              onClick={() => setSeccionActiva('costos')}
            >
              💰 Costos
            </button>
          </nav>
        </div>
      </header>

      {/* MENSAJE DE NOTIFICACIÓN */}
      {mensaje && (
        <div className={`mensaje ${mensaje.tipo}`}>
          <span>{mensaje.texto}</span>
          <button onClick={() => setMensaje(null)} className="mensaje-close">✕</button>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">

        {/* === SECCIÓN DASHBOARD === */}
        {seccionActiva === 'dashboard' && (
          <section className="seccion">
            <h2 className="seccion-titulo">Panel de Control</h2>
            <p className="seccion-descripcion">Resumen general del estado de la flota vehicular.</p>

            {/* Tarjetas de resumen */}
            <div className="cards-grid">
              <div className="card card-primary">
                <div className="card-icon">🚗</div>
                <div className="card-info">
                  <span className="card-label">Vehículos</span>
                  <strong className="card-value">{vehiculos.length}</strong>
                </div>
              </div>
              <div className="card card-success">
                <div className="card-icon">🔧</div>
                <div className="card-info">
                  <span className="card-label">Mantenimientos</span>
                  <strong className="card-value">{mantenimientos.length}</strong>
                </div>
              </div>
              <div className="card card-warning">
                <div className="card-icon">⚠️</div>
                <div className="card-info">
                  <span className="card-label">Alertas Activas</span>
                  <strong className="card-value">{alertasCriticas.length + alertasAdvertencia.length}</strong>
                </div>
              </div>
              <div className="card card-danger">
                <div className="card-icon">🔴</div>
                <div className="card-info">
                  <span className="card-label">Críticas</span>
                  <strong className="card-value">{alertasCriticas.length}</strong>
                </div>
              </div>
            </div>

            {/* Resumen rápido */}
            <div className="dashboard-grid">
              <div className="panel">
                <h3>📋 Últimos Vehículos Registrados</h3>
                {vehiculos.length === 0 ? (
                  <p className="empty-state">No hay vehículos registrados. Agregue el primero.</p>
                ) : (
                  <div className="lista-simple">
                    {vehiculos.slice(-5).reverse().map(v => (
                      <div key={v.id} className="lista-item">
                        <span className="item-placa">{v.placa}</span>
                        <span className="item-info">{v.marca} {v.modelo}</span>
                        <span className="item-km">{v.kilometraje.toLocaleString()} km</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="panel">
                <h3>⚡ Alertas Recientes</h3>
                {alertas.filter(a => a.nivel !== 'ok').length === 0 ? (
                  <p className="empty-state">✅ Todos los vehículos están en buen estado.</p>
                ) : (
                  <div className="lista-simple">
                    {alertas.filter(a => a.nivel !== 'ok').slice(0, 5).map(a => (
                      <div key={a.vehiculo.id} className={`lista-item alerta-${a.nivel}`}>
                        <span className="item-placa">{a.vehiculo.placa}</span>
                        <span className="item-info">
                          {a.nivel === 'critico' ? '🔴 URGENTE' : '🟡 Advertencia'}
                        </span>
                        <span className="item-km">{a.kmFaltantes} km restantes</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* === SECCIÓN VEHÍCULOS === */}
        {seccionActiva === 'vehiculos' && (
          <section className="seccion">
            <h2 className="seccion-titulo">Registro de Vehículos</h2>
            <p className="seccion-descripcion">Ingrese los datos del vehículo para agregarlo a la flota.</p>

            {/* Formulario de registro de vehículo */}
            <div className="form-container">
              <form onSubmit={registrarVehiculo} className="form">
                <h3>➕ Nuevo Vehículo</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="placa">Placa Vehicular *</label>
                    <input
                      type="text"
                      id="placa"
                      placeholder="Ej: ABC-123"
                      value={formVehiculo.placa}
                      onChange={(e) => setFormVehiculo({ ...formVehiculo, placa: e.target.value })}
                      maxLength={7}
                      required
                    />
                    <small className="form-hint">Formato: ABC-123 o AB-1234</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="marca">Marca *</label>
                    <input
                      type="text"
                      id="marca"
                      placeholder="Ej: Toyota"
                      value={formVehiculo.marca}
                      onChange={(e) => setFormVehiculo({ ...formVehiculo, marca: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="modelo">Modelo *</label>
                    <input
                      type="text"
                      id="modelo"
                      placeholder="Ej: Hilux"
                      value={formVehiculo.modelo}
                      onChange={(e) => setFormVehiculo({ ...formVehiculo, modelo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="anio">Año *</label>
                    <input
                      type="number"
                      id="anio"
                      placeholder="Ej: 2022"
                      min="1990"
                      max="2026"
                      value={formVehiculo.anio}
                      onChange={(e) => setFormVehiculo({ ...formVehiculo, anio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="kilometraje">Kilometraje Actual *</label>
                    <input
                      type="number"
                      id="kilometraje"
                      placeholder="Ej: 45000"
                      min="0"
                      max="999999"
                      value={formVehiculo.kilometraje}
                      onChange={(e) => setFormVehiculo({ ...formVehiculo, kilometraje: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="tipo">Tipo de Vehículo *</label>
                    <select
                      id="tipo"
                      value={formVehiculo.tipo}
                      onChange={(e) => setFormVehiculo({ ...formVehiculo, tipo: e.target.value })}
                      required
                    >
                      <option value="camioneta">Camioneta</option>
                      <option value="camion">Camión</option>
                      <option value="van">Van</option>
                      <option value="auto">Auto</option>
                      <option value="bus">Bus</option>
                      <option value="moto">Motocicleta</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  🚗 Registrar Vehículo
                </button>
              </form>
            </div>

            {/* Listado de vehículos */}
            <div className="panel">
              <h3>🚗 Flota Registrada ({vehiculos.length} vehículos)</h3>
              {vehiculos.length === 0 ? (
                <p className="empty-state">No hay vehículos registrados aún.</p>
              ) : (
                <div className="tabla-container">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Placa</th>
                        <th>Marca/Modelo</th>
                        <th>Año</th>
                        <th>Tipo</th>
                        <th>Kilometraje</th>
                        <th>Próx. Mant.</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehiculos.map(v => {
                        const alerta = alertas.find(a => a.vehiculo.id === v.id);
                        return (
                          <tr key={v.id}>
                            <td><strong>{v.placa}</strong></td>
                            <td>{v.marca} {v.modelo}</td>
                            <td>{v.anio}</td>
                            <td><span className={`badge badge-${v.tipo}`}>{v.tipo}</span></td>
                            <td>{v.kilometraje.toLocaleString()} km</td>
                            <td>{alerta ? `${alerta.proximoKm.toLocaleString()} km` : '-'}</td>
                            <td>
                              {alerta && (
                                <span className={`estado estado-${alerta.nivel}`}>
                                  {alerta.nivel === 'critico' ? '🔴 Crítico' :
                                   alerta.nivel === 'advertencia' ? '🟡 Advertencia' : '🟢 OK'}
                                </span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => eliminarVehiculo(v.id)}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* === SECCIÓN MANTENIMIENTO === */}
        {seccionActiva === 'mantenimiento' && (
          <section className="seccion">
            <h2 className="seccion-titulo">Registro de Mantenimiento</h2>
            <p className="seccion-descripcion">Registre mantenimientos y reparaciones realizadas a los vehículos.</p>

            {/* Formulario de mantenimiento */}
            <div className="form-container">
              <form onSubmit={registrarMantenimiento} className="form">
                <h3>🔧 Nuevo Mantenimiento / Reparación</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="mant-vehiculo">Vehículo *</label>
                    <select
                      id="mant-vehiculo"
                      value={formMantenimiento.vehiculoId}
                      onChange={(e) => setFormMantenimiento({ ...formMantenimiento, vehiculoId: e.target.value })}
                      required
                    >
                      <option value="">-- Seleccionar vehículo --</option>
                      {vehiculos.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.placa} - {v.marca} {v.modelo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="mant-tipo">Tipo de Servicio *</label>
                    <select
                      id="mant-tipo"
                      value={formMantenimiento.tipo}
                      onChange={(e) => setFormMantenimiento({ ...formMantenimiento, tipo: e.target.value })}
                      required
                    >
                      <option value="preventivo">Mantenimiento Preventivo</option>
                      <option value="correctivo">Mantenimiento Correctivo</option>
                      <option value="aceite">Cambio de Aceite</option>
                      <option value="frenos">Revisión de Frenos</option>
                      <option value="neumaticos">Neumáticos</option>
                      <option value="motor">Reparación de Motor</option>
                      <option value="electrico">Sistema Eléctrico</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="mant-fecha">Fecha *</label>
                    <input
                      type="date"
                      id="mant-fecha"
                      value={formMantenimiento.fecha}
                      onChange={(e) => setFormMantenimiento({ ...formMantenimiento, fecha: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mant-km">Kilometraje al momento *</label>
                    <input
                      type="number"
                      id="mant-km"
                      placeholder="Ej: 50000"
                      min="0"
                      value={formMantenimiento.kilometraje}
                      onChange={(e) => setFormMantenimiento({ ...formMantenimiento, kilometraje: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mant-costo">Costo (S/) *</label>
                    <input
                      type="number"
                      id="mant-costo"
                      placeholder="Ej: 250.00"
                      min="0"
                      step="0.01"
                      value={formMantenimiento.costo}
                      onChange={(e) => setFormMantenimiento({ ...formMantenimiento, costo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group form-group-full">
                    <label htmlFor="mant-desc">Descripción *</label>
                    <textarea
                      id="mant-desc"
                      placeholder="Describa el trabajo realizado..."
                      rows={3}
                      value={formMantenimiento.descripcion}
                      onChange={(e) => setFormMantenimiento({ ...formMantenimiento, descripcion: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  🔧 Registrar Mantenimiento
                </button>
              </form>
            </div>

            {/* Historial de mantenimientos */}
            <div className="panel">
              <h3>📋 Historial de Mantenimientos ({mantenimientos.length} registros)</h3>
              {mantenimientos.length === 0 ? (
                <p className="empty-state">No hay mantenimientos registrados aún.</p>
              ) : (
                <div className="tabla-container">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Vehículo</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Kilometraje</th>
                        <th>Costo</th>
                        <th>Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...mantenimientos].reverse().map(m => {
                        const vehiculo = vehiculos.find(v => v.id === m.vehiculoId);
                        return (
                          <tr key={m.id}>
                            <td><strong>{vehiculo ? vehiculo.placa : 'N/A'}</strong></td>
                            <td><span className={`badge badge-mant-${m.tipo}`}>{m.tipo}</span></td>
                            <td>{formatearFecha(m.fecha)}</td>
                            <td>{m.kilometraje.toLocaleString()} km</td>
                            <td><strong>{formatearMoneda(m.costo)}</strong></td>
                            <td className="descripcion-cell">{m.descripcion}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* === SECCIÓN ALERTAS === */}
        {seccionActiva === 'alertas' && (
          <section className="seccion">
            <h2 className="seccion-titulo">Alertas de Mantenimiento Predictivo</h2>
            <p className="seccion-descripcion">
              Sistema de alertas basado en kilometraje (cada 10,000 km) y tiempo (cada 6 meses).
            </p>

            {vehiculos.length === 0 ? (
              <div className="empty-panel">
                <p className="empty-state">No hay vehículos registrados. Agregue vehículos para ver alertas.</p>
              </div>
            ) : (
              <>
                {/* Alertas críticas */}
                {alertasCriticas.length > 0 && (
                  <div className="panel panel-danger">
                    <h3>🔴 Mantenimiento Crítico ({alertasCriticas.length})</h3>
                    <p className="panel-desc">Estos vehículos requieren atención inmediata.</p>
                    <div className="alertas-grid">
                      {alertasCriticas.map(a => (
                        <div key={a.vehiculo.id} className="alerta-card alerta-critico">
                          <div className="alerta-header">
                            <strong className="alerta-placa">{a.vehiculo.placa}</strong>
                            <span className="alerta-badge critico">CRÍTICO</span>
                          </div>
                          <p className="alerta-vehiculo">{a.vehiculo.marca} {a.vehiculo.modelo} ({a.vehiculo.anio})</p>
                          <div className="alerta-detalles">
                            <div className="alerta-dato">
                              <span>Km faltantes:</span>
                              <strong>{a.kmFaltantes} km</strong>
                            </div>
                            <div className="alerta-dato">
                              <span>Meses sin mant.:</span>
                              <strong>{a.mesesSinMant} meses</strong>
                            </div>
                            <div className="alerta-dato">
                              <span>Próximo servicio:</span>
                              <strong>{a.proximoKm.toLocaleString()} km</strong>
                            </div>
                            <div className="alerta-dato">
                              <span>Costo estimado:</span>
                              <strong>{formatearMoneda(a.costoEstimado)}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alertas de advertencia */}
                {alertasAdvertencia.length > 0 && (
                  <div className="panel panel-warning">
                    <h3>🟡 Próximo Mantenimiento ({alertasAdvertencia.length})</h3>
                    <p className="panel-desc">Planifique el mantenimiento de estos vehículos pronto.</p>
                    <div className="alertas-grid">
                      {alertasAdvertencia.map(a => (
                        <div key={a.vehiculo.id} className="alerta-card alerta-advertencia">
                          <div className="alerta-header">
                            <strong className="alerta-placa">{a.vehiculo.placa}</strong>
                            <span className="alerta-badge advertencia">ADVERTENCIA</span>
                          </div>
                          <p className="alerta-vehiculo">{a.vehiculo.marca} {a.vehiculo.modelo} ({a.vehiculo.anio})</p>
                          <div className="alerta-detalles">
                            <div className="alerta-dato">
                              <span>Km faltantes:</span>
                              <strong>{a.kmFaltantes} km</strong>
                            </div>
                            <div className="alerta-dato">
                              <span>Meses sin mant.:</span>
                              <strong>{a.mesesSinMant} meses</strong>
                            </div>
                            <div className="alerta-dato">
                              <span>Próximo servicio:</span>
                              <strong>{a.proximoKm.toLocaleString()} km</strong>
                            </div>
                            <div className="alerta-dato">
                              <span>Costo estimado:</span>
                              <strong>{formatearMoneda(a.costoEstimado)}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vehículos en buen estado */}
                <div className="panel panel-success">
                  <h3>🟢 Vehículos en Buen Estado ({alertas.filter(a => a.nivel === 'ok').length})</h3>
                  {alertas.filter(a => a.nivel === 'ok').length === 0 ? (
                    <p className="empty-state">No hay vehículos en estado óptimo actualmente.</p>
                  ) : (
                    <div className="alertas-grid">
                      {alertas.filter(a => a.nivel === 'ok').map(a => (
                        <div key={a.vehiculo.id} className="alerta-card alerta-ok">
                          <div className="alerta-header">
                            <strong className="alerta-placa">{a.vehiculo.placa}</strong>
                            <span className="alerta-badge ok">OK</span>
                          </div>
                          <p className="alerta-vehiculo">{a.vehiculo.marca} {a.vehiculo.modelo} ({a.vehiculo.anio})</p>
                          <div className="alerta-detalles">
                            <div className="alerta-dato">
                              <span>Km faltantes:</span>
                              <strong>{a.kmFaltantes} km</strong>
                            </div>
                            <div className="alerta-dato">
                              <span>Próximo servicio:</span>
                              <strong>{a.proximoKm.toLocaleString()} km</strong>
                            </div>
                            <div className="alerta-dato">
                              <span>Costo estimado:</span>
                              <strong>{formatearMoneda(a.costoEstimado)}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        {/* === SECCIÓN COSTOS === */}
        {seccionActiva === 'costos' && (
          <section className="seccion">
            <h2 className="seccion-titulo">Resumen de Costos</h2>
            <p className="seccion-descripcion">Análisis financiero de los mantenimientos de la flota.</p>

            {/* Tarjetas de costos */}
            <div className="cards-grid">
              <div className="card card-primary">
                <div className="card-icon">💰</div>
                <div className="card-info">
                  <span className="card-label">Costo Total</span>
                  <strong className="card-value">{formatearMoneda(costoTotal)}</strong>
                </div>
              </div>
              <div className="card card-success">
                <div className="card-icon">📊</div>
                <div className="card-info">
                  <span className="card-label">Promedio</span>
                  <strong className="card-value">{formatearMoneda(costoPromedio)}</strong>
                </div>
              </div>
              <div className="card card-warning">
                <div className="card-icon">📈</div>
                <div className="card-info">
                  <span className="card-label">Máximo</span>
                  <strong className="card-value">{formatearMoneda(costoMaximo)}</strong>
                </div>
              </div>
              <div className="card card-info">
                <div className="card-icon">📉</div>
                <div className="card-info">
                  <span className="card-label">Mínimo</span>
                  <strong className="card-value">{formatearMoneda(costoMinimo)}</strong>
                </div>
              </div>
            </div>

            {/* Costos por vehículo */}
            <div className="panel">
              <h3>💵 Costos por Vehículo</h3>
              {vehiculos.length === 0 ? (
                <p className="empty-state">No hay datos para mostrar.</p>
              ) : (
                <div className="tabla-container">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Vehículo</th>
                        <th>Mantenimientos</th>
                        <th>Costo Total</th>
                        <th>Costo Promedio</th>
                        <th>Costo Estimado Próx.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehiculos.map(v => {
                        const mantVehiculo = mantenimientos.filter(m => m.vehiculoId === v.id);
                        const totalVehiculo = mantVehiculo.reduce((acc, m) => acc + m.costo, 0);
                        const promVehiculo = calcularPromedioCostos(mantVehiculo.map(m => m.costo));
                        const costoEst = calcularCostoEstimado(v.kilometraje, v.anio);
                        return (
                          <tr key={v.id}>
                            <td><strong>{v.placa}</strong> - {v.marca} {v.modelo}</td>
                            <td>{mantVehiculo.length}</td>
                            <td>{formatearMoneda(totalVehiculo)}</td>
                            <td>{formatearMoneda(promVehiculo)}</td>
                            <td>{formatearMoneda(costoEst)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Proyección de costos */}
            <div className="panel">
              <h3>📅 Proyección de Costos Próximos 3 Meses</h3>
              <div className="proyeccion-info">
                <p>
                  Basado en el análisis predictivo, se estiman{' '}
                  <strong>{alertas.filter(a => a.nivel !== 'ok').length}</strong> mantenimientos
                  en los próximos 3 meses con un costo estimado total de{' '}
                  <strong>
                    {formatearMoneda(
                      alertas
                        .filter(a => a.nivel !== 'ok')
                        .reduce((acc, a) => acc + a.costoEstimado, 0)
                    )}
                  </strong>.
                </p>
                <div className="proyeccion-grid">
                  {alertas.filter(a => a.nivel !== 'ok').map(a => (
                    <div key={a.vehiculo.id} className="proyeccion-item">
                      <span className="proyeccion-placa">{a.vehiculo.placa}</span>
                      <span className="proyeccion-costo">{formatearMoneda(a.costoEstimado)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>FleetCare © 2026 — Sistema de Gestión y Mantenimiento Predictivo de Flotas Vehiculares</p>
        <p className="footer-sub">Desarrollado con HTML + CSS + JavaScript | Universidad</p>
      </footer>
    </div>
  );
}
