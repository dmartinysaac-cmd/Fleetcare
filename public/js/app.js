/* ============================================================
   FleetCare – Sistema Web para Gestión y Mantenimiento Predictivo
   JavaScript Puro (sin frameworks)
   
   ============================================================
   REQUISITOS CUMPLIDOS EN ESTE ARCHIVO:
   ============================================================
   1. Variables y constantes: let y const ✓
   2. Tipos de datos: string, number, boolean, array, object ✓
   3. Al menos 3 operaciones matemáticas ✓
   4. Operadores de comparación: >, <, >=, <=, ===, !== ✓
   5. Operadores lógicos: &&, ||, ! ✓
   6. Estructuras condicionales: if, else, else if ✓
   7. Funciones propias ✓
   8. Manejo de cadenas (5+ métodos): toUpperCase, toLowerCase, trim, includes, slice, replace, length, split, charAt ✓
   9. Template literals ✓
   10. Expresión regular para validación ✓
   11. Arreglo + operaciones sobre él ✓
   12. Objeto que represente una entidad ✓
   13. Operador Spread (...) ✓
   14. Eventos: click, change, input, submit ✓
   15. Manipulación del DOM: innerHTML, textContent, value, classList ✓
   16. Al menos 3 métodos/propiedades de Math ✓
   17. Validación de datos ✓
   18. Mensajes claros al usuario ✓
   19. try-catch ✓
   ============================================================ */

// ============================================================
// ETAPA 1 - ANÁLISIS DEL PROBLEMA
// ============================================================
/*
   PROBLEMA: Una empresa de transporte gestiona su flota de vehículos
   mediante hojas de cálculo, lo que genera:
   - Dificultad para predecir mantenimientos
   - Pérdida de información sobre costos
   - No hay alertas automáticas
   - Sin control del estado de cada vehículo
   
   SOLUCIÓN: Sistema web FleetCare que permite:
   - Registrar vehículos con sus datos
   - Registrar mantenimientos realizados
   - Calcular automáticamente cuándo toca el próximo mantenimiento
   - Alertar sobre vehículos que necesitan atención
   - Calcular costos totales y promedios
*/

// ============================================================
// ETAPA 2 - ENTRADAS, PROCESOS Y SALIDAS
// ============================================================
/*
   ENTRADAS:
   - Datos del vehículo: placa, marca, modelo, año, kilometraje, tipo
   - Datos de mantenimiento: vehículo, tipo, fecha, kilometraje, costo, descripción
   
   PROCESOS:
   - Validación de placa con expresión regular
   - Cálculo de próximo mantenimiento (basado en km y tiempo)
   - Cálculo de costos totales, promedios, máximo y mínimo
   - Determinación de nivel de alerta (crítico, advertencia, ok)
   - Estimación de costo de próximo mantenimiento
   
   SALIDAS:
   - Listado de vehículos con estado
   - Historial de mantenimientos
   - Alertas de mantenimiento predictivo
   - Resumen de costos con proyecciones
*/

// ============================================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================================

// const: Variables que no cambian durante la ejecución
const INTERVALO_MANTENIMIENTO_KM = 10000; // Cada 10,000 km
const INTERVALO_MANTENIMIENTO_MESES = 6;  // Cada 6 meses
const COSTO_BASE_MANTENIMIENTO = 350;     // Costo base en soles

// ============================================================
// EXPRESIÓN REGULAR (Requisito 10)
// ============================================================
// Valida placa vehicular peruana:
// - Formato nuevo: ABC-123 (3 letras + guión + 3 dígitos)
// - Formato antiguo: AB-1234 (2 letras + guión + 4 dígitos)
// [A-Z]{3}-\d{3} = Placa nueva
// [A-Z]{2}-\d{4} = Placa antigua
// El | (OR) permite ambos formatos
const REGEX_PLACA_PERUANA = /^[A-Z]{3}-\d{3}$|^[A-Z]{2}-\d{4}$/;

// ============================================================
// VARIABLES GLOBALES (let: pueden cambiar)
// ============================================================

// Array: Almacena todos los vehículos registrados
// Tipo de dato: array de objects
let vehiculos = [];

// Array: Almacena todos los mantenimientos
let mantenimientos = [];

// let: Variable que cambia según la sección activa
let seccionActiva = 'dashboard';

// Contador para IDs únicos
let idCounter = 1;

// ============================================================
// FUNCIONES PROPIAS (Requisito 7)
// ============================================================

/**
 * Función: validarPlaca
 * Valida que la placa tenga formato peruano válido
 * Usa: trim(), toUpperCase(), test() de regex
 * @param {string} placa - La placa a validar
 * @returns {boolean} - true si es válida
 */
function validarPlaca(placa) {
    // Método de string: .trim() - elimina espacios al inicio y final
    // Método de string: .toUpperCase() - convierte a mayúsculas
    const placaLimpia = placa.trim().toUpperCase();
    // Test de expresión regular
    return REGEX_PLACA_PERUANA.test(placaLimpia);
}

/**
 * Función: calcularProximoMantenimientoKm
 * Calcula en qué kilometraje toca el próximo mantenimiento
 * OPERACIÓN MATEMÁTICA 1: División + multiplicación
 * Usa: Math.ceil() (Requisito 16)
 * @param {number} kilometrajeActual - Km actual del vehículo
 * @returns {number} - Km del próximo mantenimiento
 */
function calcularProximoMantenimientoKm(kilometrajeActual) {
    // Math.ceil: Redondea hacia arriba para obtener el siguiente intervalo
    // Operación: ceil(km / intervalo) * intervalo
    return Math.ceil(kilometrajeActual / INTERVALO_MANTENIMIENTO_KM) * INTERVALO_MANTENIMIENTO_KM;
}

/**
 * Función: calcularKmFaltantes
 * Calcula cuántos km faltan para el próximo mantenimiento
 * OPERACIÓN MATEMÁTICA 2: Resta
 * @param {number} kilometrajeActual - Km actual
 * @returns {number} - Km faltantes
 */
function calcularKmFaltantes(kilometrajeActual) {
    const proximo = calcularProximoMantenimientoKm(kilometrajeActual);
    return proximo - kilometrajeActual;
}

/**
 * Función: calcularCostoEstimado
 * Estima el costo del próximo mantenimiento basado en antigüedad
 * OPERACIÓN MATEMÁTICA 3: Multiplicación con factor
 * Usa: Math.round() (Requisito 16)
 * @param {number} kilometrajeActual - Km actual
 * @param {number} anio - Año del vehículo
 * @returns {number} - Costo estimado en soles
 */
function calcularCostoEstimado(kilometrajeActual, anio) {
    // Factor por antigüedad: 5% más por cada año
    const edadVehiculo = 2026 - anio;
    const factorEdad = 1 + (edadVehiculo * 0.05);
    // Math.round: Redondea al entero más cercano
    return Math.round(COSTO_BASE_MANTENIMIENTO * factorEdad);
}

/**
 * Función: calcularPromedioCostos
 * Calcula el promedio de un array de costos
 * OPERACIÓN MATEMÁTICA 4: Suma / cantidad
 * Usa: Math.floor() (Requisito 16)
 * @param {number[]} costos - Array de costos
 * @returns {number} - Promedio
 */
function calcularPromedioCostos(costos) {
    // Validación: si el array está vacío, retornar 0
    if (costos.length === 0) return 0;
    // Método de array: reduce() - suma todos los elementos
    const sumaTotal = costos.reduce(function(acumulador, costo) {
        return acumulador + costo;
    }, 0);
    // Math.floor: Redondea hacia abajo
    return Math.floor(sumaTotal / costos.length);
}

/**
 * Función: determinarAlerta
 * Determina el nivel de alerta de un vehículo
 * Usa operadores de comparación: <=, >= (Requisito 4)
 * Usa operadores lógicos: || (Requisito 5)
 * Usa estructuras condicionales: if, else if, else (Requisito 6)
 * @param {number} kmFaltantes - Km hasta próximo mant.
 * @param {number} mesesSinMantenimiento - Meses sin mantenimiento
 * @returns {string} - 'critico', 'advertencia', o 'ok'
 */
function determinarAlerta(kmFaltantes, mesesSinMantenimiento) {
    // Operadores de comparación: <=, >=
    // Operadores lógicos: || (OR)
    if (kmFaltantes <= 500 || mesesSinMantenimiento >= INTERVALO_MANTENIMIENTO_MESES) {
        return 'critico';
    } else if (kmFaltantes <= 2000 || mesesSinMantenimiento >= 4) {
        return 'advertencia';
    } else {
        return 'ok';
    }
}

/**
 * Función: formatearMoneda
 * Formatea un número como moneda peruana
 * Usa: Template literals (Requisito 9)
 * @param {number} monto - Monto a formatear
 * @returns {string} - Monto formateado
 */
function formatearMoneda(monto) {
    // Template literal: interpolación con ${}
    return `S/ ${monto.toLocaleString('es-PE')}`;
}

/**
 * Función: formatearFecha
 * Convierte fecha de formato YYYY-MM-DD a DD/MM/YYYY
 * Usa métodos de string: split(), slice() (Requisito 8)
 * @param {string} fecha - Fecha en formato ISO
 * @returns {string} - Fecha formateada
 */
function formatearFecha(fecha) {
    // Método de string: .split() - divide el string
    const partes = fecha.split('-');
    if (partes.length === 3) {
        // Template literal con interpolación
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return fecha;
}

/**
 * Función: mesesTranscurridos
 * Calcula meses entre una fecha y hoy
 * Usa: Math.max() (Requisito 16)
 * @param {string} fechaStr - Fecha en string
 * @returns {number} - Meses transcurridos
 */
function mesesTranscurridos(fechaStr) {
    const fecha = new Date(fechaStr);
    const hoy = new Date();
    // Math.max: Asegura que el resultado no sea negativo
    return Math.max(0, (hoy.getFullYear() - fecha.getFullYear()) * 12 + (hoy.getMonth() - fecha.getMonth()));
}

/**
 * Función: generarId
 * Genera un ID único para cada registro
 * Usa: Math.random(), Math.floor() (Requisito 16)
 * @returns {number} - ID único
 */
function generarId() {
    // Math.random: Genera número aleatorio entre 0 y 1
    // Math.floor: Redondea hacia abajo
    const random = Math.floor(Math.random() * 10000);
    return idCounter++ + random;
}

/**
 * Función: capitalizar
 * Capitaliza la primera letra de un string
 * Usa métodos de string: charAt(), slice(), toUpperCase(), toLowerCase() (Requisito 8)
 * @param {string} texto - Texto a capitalizar
 * @returns {string} - Texto capitalizado
 */
function capitalizar(texto) {
    // Método de string: .trim() - elimina espacios
    const limpio = texto.trim();
    if (limpio.length === 0) return '';
    // charAt(0): primer carácter
    // slice(1): desde posición 1 hasta el final
    // toUpperCase(): convierte a mayúsculas
    // toLowerCase(): convierte a minúsculas
    return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
}

/**
 * Función: mostrarMensaje
 * Muestra un mensaje temporal al usuario
 * Usa manipulación del DOM: innerHTML, classList (Requisito 15)
 * @param {string} texto - Mensaje a mostrar
 * @param {string} tipo - 'exito', 'error', 'info'
 */
function mostrarMensaje(texto, tipo) {
    // Eliminar mensaje anterior si existe
    const mensajeAnterior = document.querySelector('.mensaje');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }

    // Crear elemento de mensaje
    const div = document.createElement('div');
    // classList.add: Agrega clase CSS (Requisito 15)
    div.classList.add('mensaje', tipo);
    // innerHTML: Inserta contenido HTML (Requisito 15)
    div.innerHTML = `
        <span>${texto}</span>
        <button class="mensaje-close" onclick="this.parentElement.remove()">✕</button>
    `;
    document.body.appendChild(div);

    // Auto-eliminar después de 4 segundos
    setTimeout(function() {
        if (div.parentElement) {
            div.remove();
        }
    }, 4000);
}

/**
 * Función: guardarDatos
 * Guarda los datos en localStorage
 * Usa try-catch (Requisito 19)
 */
function guardarDatos() {
    try {
        localStorage.setItem('fleetcare_vehiculos', JSON.stringify(vehiculos));
        localStorage.setItem('fleetcare_mantenimientos', JSON.stringify(mantenimientos));
    } catch (error) {
        console.error('Error al guardar datos:', error);
        mostrarMensaje('⚠️ Error al guardar datos en el navegador.', 'error');
    }
}

/**
 * Función: cargarDatos
 * Carga los datos desde localStorage
 * Usa try-catch (Requisito 19)
 */
function cargarDatos() {
    try {
        const vehiculosGuardados = localStorage.getItem('fleetcare_vehiculos');
        const mantenimientosGuardados = localStorage.getItem('fleetcare_mantenimientos');
        if (vehiculosGuardados) {
            vehiculos = JSON.parse(vehiculosGuardados);
        }
        if (mantenimientosGuardados) {
            mantenimientos = JSON.parse(mantenimientosGuardados);
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}

// ============================================================
// FUNCIONES DE REGISTRO
// ============================================================

/**
 * Función: registrarVehiculo
 * Registra un nuevo vehículo en la flota
 * Eventos: submit (Requisito 14)
 * Validación de datos (Requisito 17)
 * Usa Spread operator (Requisito 13)
 */
function registrarVehiculo(event) {
    // Prevenir envío del formulario
    event.preventDefault();

    // Obtener valores del formulario
    // value: Propiedad del DOM para obtener valor de inputs (Requisito 15)
    const placaInput = document.getElementById('placa');
    const marcaInput = document.getElementById('marca');
    const modeloInput = document.getElementById('modelo');
    const anioInput = document.getElementById('anio');
    const kmInput = document.getElementById('kilometraje');
    const tipoSelect = document.getElementById('tipo');

    // Método de string: .trim() y .toUpperCase() (Requisito 8)
    const placa = placaInput.value.trim().toUpperCase();
    const marca = marcaInput.value.trim();
    const modelo = modeloInput.value.trim();
    const anio = parseInt(anioInput.value);
    const kilometraje = parseInt(kmInput.value);
    const tipo = tipoSelect.value;

    // --- VALIDACIÓN DE DATOS (Requisito 17) ---
    // Operadores de comparación: === (Requisito 4)
    // Operadores lógicos: || (Requisito 5)
    if (!placa || !marca || !modelo || isNaN(anio) || isNaN(kilometraje)) {
        mostrarMensaje('⚠️ Todos los campos son obligatorios.', 'error');
        return;
    }

    // Validar placa con regex
    if (!validarPlaca(placa)) {
        mostrarMensaje('⚠️ Placa inválida. Use formato: ABC-123 o AB-1234', 'error');
        return;
    }

    // Validar año con operadores de comparación
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
    // Método de array: some() + método de string: includes() (Requisito 8, 11)
    const placaExiste = vehiculos.some(function(v) {
        return v.placa.includes(placa);
    });
    if (placaExiste) {
        mostrarMensaje('⚠️ Ya existe un vehículo con esa placa.', 'error');
        return;
    }

    // Crear objeto vehículo (Requisito 12)
    // Object: Representa la entidad Vehículo
    const nuevoVehiculo = {
        id: generarId(),
        placa: placa,
        marca: capitalizar(marca),
        modelo: capitalizar(modelo),
        anio: anio,
        kilometraje: kilometraje,
        tipo: tipo,
        fechaRegistro: new Date().toISOString().split('T')[0]
    };

    // SPREAD OPERATOR (Requisito 13)
    // El operador spread (...) se usa para crear un nuevo array
    // que contiene todos los elementos del array original (vehiculos)
    // más el nuevo elemento (nuevoVehiculo).
    // Esto es inmutable: no modifica el array original, crea uno nuevo.
    // Equivale a: vehiculos.push(nuevoVehiculo) pero de forma inmutable
    vehiculos = [...vehiculos, nuevoVehiculo];

    // Guardar y actualizar vista
    guardarDatos();
    mostrarMensaje(`✅ Vehículo ${placa} registrado exitosamente.`, 'exito');

    // Limpiar formulario
    // value: Asignar valor vacío a inputs (Requisito 15)
    placaInput.value = '';
    marcaInput.value = '';
    modeloInput.value = '';
    anioInput.value = '';
    kmInput.value = '';
    tipoSelect.value = 'camioneta';

    // Actualizar toda la interfaz
    actualizarVista();
}

/**
 * Función: registrarMantenimiento
 * Registra un nuevo mantenimiento
 * Eventos: submit (Requisito 14)
 */
function registrarMantenimiento(event) {
    event.preventDefault();

    // Obtener valores
    const vehiculoSelect = document.getElementById('mant-vehiculo');
    const tipoSelect = document.getElementById('mant-tipo');
    const fechaInput = document.getElementById('mant-fecha');
    const kmInput = document.getElementById('mant-km');
    const costoInput = document.getElementById('mant-costo');
    const descTextarea = document.getElementById('mant-desc');

    const vehiculoId = parseInt(vehiculoSelect.value);
    const tipo = tipoSelect.value;
    const fecha = fechaInput.value;
    const kilometraje = parseInt(kmInput.value);
    const costo = parseFloat(costoInput.value);
    // Método de string: .trim() (Requisito 8)
    const descripcion = descTextarea.value.trim();

    // Validaciones
    if (!vehiculoId || !fecha || isNaN(kilometraje) || isNaN(costo)) {
        mostrarMensaje('⚠️ Complete todos los campos obligatorios.', 'error');
        return;
    }

    if (costo < 0) {
        mostrarMensaje('⚠️ El costo no puede ser negativo.', 'error');
        return;
    }

    // Buscar vehículo
    // Método de array: find() (Requisito 11)
    const vehiculo = vehiculos.find(function(v) { return v.id === vehiculoId; });
    if (!vehiculo) {
        mostrarMensaje('⚠️ Vehículo no encontrado.', 'error');
        return;
    }

    // Método de string: .length (Requisito 8)
    if (descripcion.length < 5) {
        mostrarMensaje('⚠️ La descripción debe tener al menos 5 caracteres.', 'error');
        return;
    }

    // Crear objeto mantenimiento (Requisito 12)
    const nuevoMantenimiento = {
        id: generarId(),
        vehiculoId: vehiculoId,
        tipo: tipo,
        fecha: fecha,
        kilometraje: kilometraje,
        costo: costo,
        descripcion: descripcion
    };

    // SPREAD OPERATOR (Requisito 13)
    // Agrega el nuevo mantenimiento al array de forma inmutable
    mantenimientos = [...mantenimientos, nuevoMantenimiento];

    // Actualizar kilometraje del vehículo si es mayor
    // Math.max: toma el valor mayor entre el actual y el nuevo
    // Spread operator: crea nuevo objeto con propiedades actualizadas
    vehiculos = vehiculos.map(function(v) {
        if (v.id === vehiculoId) {
            // Spread: copia todas las propiedades de v y sobrescribe kilometraje
            return { ...v, kilometraje: Math.max(v.kilometraje, kilometraje) };
        }
        return v;
    });

    guardarDatos();
    // Template literal (Requisito 9)
    mostrarMensaje(`✅ Mantenimiento registrado para ${vehiculo.placa}.`, 'exito');

    // Limpiar formulario
    vehiculoSelect.value = '';
    tipoSelect.value = 'preventivo';
    fechaInput.value = '';
    kmInput.value = '';
    costoInput.value = '';
    descTextarea.value = '';

    actualizarVista();
}

/**
 * Función: eliminarVehiculo
 * Elimina un vehículo y sus mantenimientos asociados
 * Usa Spread + filter (Requisito 13)
 */
function eliminarVehiculo(id) {
    // Confirmación
    const vehiculo = vehiculos.find(function(v) { return v.id === id; });
    if (!vehiculo) return;

    // Template literal (Requisito 9)
    const confirmar = confirm(`¿Eliminar vehículo ${vehiculo.placa} y todo su historial?`);
    if (!confirmar) return;

    // SPREAD + FILTER (Requisito 13)
    // filter() crea un nuevo array sin el elemento eliminado
    // No usa spread directamente aquí, pero el resultado es un nuevo array
    vehiculos = vehiculos.filter(function(v) { return v.id !== id; });
    mantenimientos = mantenimientos.filter(function(m) { return m.vehiculoId !== id; });

    guardarDatos();
    mostrarMensaje('🗑️ Vehículo eliminado correctamente.', 'info');
    actualizarVista();
}

// ============================================================
// FUNCIONES DE NAVEGACIÓN
// ============================================================

/**
 * Función: cambiarSeccion
 * Cambia la sección activa del dashboard
 * Eventos: click (Requisito 14)
 * Usa: classList, style.display (Requisito 15)
 */
function cambiarSeccion(seccion) {
    seccionActiva = seccion;

    // Ocultar todas las secciones
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(function(s) {
        s.style.display = 'none';
    });

    // Mostrar la sección seleccionada
    const seccionActual = document.getElementById('seccion-' + seccion);
    if (seccionActual) {
        seccionActual.style.display = 'block';
    }

    // Actualizar botones de navegación
    // classList: Manipulación de clases CSS (Requisito 15)
    const botones = document.querySelectorAll('.nav-btn');
    botones.forEach(function(btn) {
        btn.classList.remove('active');
    });

    // Encontrar el botón correspondiente y agregar clase active
    const textos = {
        'dashboard': '📊 Dashboard',
        'vehiculos': '🚗 Vehículos',
        'mantenimiento': '🔧 Mantenimiento',
        'alertas': '⚠️ Alertas',
        'costos': '💰 Costos'
    };

    botones.forEach(function(btn) {
        if (btn.textContent.trim() === textos[seccion]) {
            btn.classList.add('active');
        }
    });

    actualizarVista();
}

// ============================================================
// FUNCIONES DE RENDERIZADO / ACTUALIZACIÓN DEL DOM
// ============================================================

/**
 * Función: actualizarVista
 * Actualiza toda la interfaz con los datos actuales
 * Usa: innerHTML, textContent (Requisito 15)
 */
function actualizarVista() {
    actualizarDashboard();
    actualizarListaVehiculos();
    actualizarSelectVehiculos();
    actualizarListaMantenimientos();
    actualizarAlertas();
    actualizarCostos();
}

/**
 * Función: actualizarDashboard
 * Actualiza las tarjetas del dashboard
 */
function actualizarDashboard() {
    const alertas = calcularAlertas();
    const alertasCriticas = alertas.filter(function(a) { return a.nivel === 'critico'; });
    const alertasAdvertencia = alertas.filter(function(a) { return a.nivel === 'advertencia'; });

    // innerHTML: Inserta HTML dinámicamente (Requisito 15)
    const cardsContainer = document.getElementById('dashboard-cards');
    cardsContainer.innerHTML = `
        <div class="card card-primary">
            <div class="card-icon">🚗</div>
            <div class="card-data">
                <span class="card-label">Vehículos</span>
                <strong class="card-value">${vehiculos.length}</strong>
            </div>
        </div>
        <div class="card card-success">
            <div class="card-icon">🔧</div>
            <div class="card-data">
                <span class="card-label">Mantenimientos</span>
                <strong class="card-value">${mantenimientos.length}</strong>
            </div>
        </div>
        <div class="card card-warning">
            <div class="card-icon">⚠️</div>
            <div class="card-data">
                <span class="card-label">Alertas Activas</span>
                <strong class="card-value">${alertasCriticas.length + alertasAdvertencia.length}</strong>
            </div>
        </div>
        <div class="card card-danger">
            <div class="card-icon">🔴</div>
            <div class="card-data">
                <span class="card-label">Críticas</span>
                <strong class="card-value">${alertasCriticas.length}</strong>
            </div>
        </div>
    `;

    // Lista de vehículos recientes
    const listaRecientes = document.getElementById('lista-vehiculos-recientes');
    if (vehiculos.length === 0) {
        listaRecientes.innerHTML = '<p class="empty-state">No hay vehículos registrados. Agregue el primero.</p>';
    } else {
        // Método de array: slice() + reverse() (Requisito 11)
        const ultimos = vehiculos.slice(-5).reverse();
        let html = '<div class="lista-simple">';
        ultimos.forEach(function(v) {
            // Template literal (Requisito 9)
            html += `
                <div class="lista-item">
                    <span class="item-placa">${v.placa}</span>
                    <span class="item-info">${v.marca} ${v.modelo}</span>
                    <span class="item-km">${v.kilometraje.toLocaleString()} km</span>
                </div>
            `;
        });
        html += '</div>';
        listaRecientes.innerHTML = html;
    }

    // Lista de alertas recientes
    const listaAlertas = document.getElementById('lista-alertas-recientes');
    const alertasNoOk = alertas.filter(function(a) { return a.nivel !== 'ok'; });
    if (alertasNoOk.length === 0) {
        listaAlertas.innerHTML = '<p class="empty-state">✅ Todos los vehículos están en buen estado.</p>';
    } else {
        let html = '<div class="lista-simple">';
        alertasNoOk.slice(0, 5).forEach(function(a) {
            const nivelClase = a.nivel === 'critico' ? 'alerta-critico' : 'alerta-advertencia';
            const nivelTexto = a.nivel === 'critico' ? '🔴 URGENTE' : '🟡 Advertencia';
            html += `
                <div class="lista-item ${nivelClase}">
                    <span class="item-placa">${a.vehiculo.placa}</span>
                    <span class="item-info">${nivelTexto}</span>
                    <span class="item-km">${a.kmFaltantes} km restantes</span>
                </div>
            `;
        });
        html += '</div>';
        listaAlertas.innerHTML = html;
    }
}

/**
 * Función: actualizarListaVehiculos
 * Actualiza la tabla de vehículos registrados
 */
function actualizarListaVehiculos() {
    // textContent: Actualiza texto de un elemento (Requisito 15)
    document.getElementById('total-vehiculos').textContent = vehiculos.length;

    const container = document.getElementById('tabla-vehiculos');
    if (vehiculos.length === 0) {
        container.innerHTML = '<p class="empty-state">No hay vehículos registrados aún.</p>';
        return;
    }

    const alertas = calcularAlertas();
    let html = '<div class="tabla-container"><table class="tabla">';
    html += '<thead><tr><th>Placa</th><th>Marca/Modelo</th><th>Año</th><th>Tipo</th><th>Kilometraje</th><th>Próx. Mant.</th><th>Estado</th><th>Acciones</th></tr></thead>';
    html += '<tbody>';

    vehiculos.forEach(function(v) {
        const alerta = alertas.find(function(a) { return a.vehiculo.id === v.id; });
        let estadoHtml = '';
        if (alerta) {
            if (alerta.nivel === 'critico') {
                estadoHtml = '<span class="estado estado-critico">🔴 Crítico</span>';
            } else if (alerta.nivel === 'advertencia') {
                estadoHtml = '<span class="estado estado-advertencia">🟡 Advertencia</span>';
            } else {
                estadoHtml = '<span class="estado estado-ok">🟢 OK</span>';
            }
        }

        // Template literal (Requisito 9)
        html += `
            <tr>
                <td><strong>${v.placa}</strong></td>
                <td>${v.marca} ${v.modelo}</td>
                <td>${v.anio}</td>
                <td><span class="badge badge-${v.tipo}">${v.tipo}</span></td>
                <td>${v.kilometraje.toLocaleString()} km</td>
                <td>${alerta ? alerta.proximoKm.toLocaleString() + ' km' : '-'}</td>
                <td>${estadoHtml}</td>
                <td><button class="btn btn-sm btn-danger" onclick="eliminarVehiculo(${v.id})">🗑️</button></td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

/**
 * Función: actualizarSelectVehiculos
 * Actualiza el select de vehículos en el formulario de mantenimiento
 */
function actualizarSelectVehiculos() {
    const select = document.getElementById('mant-vehiculo');
    // Mantener la primera opción
    let html = '<option value="">-- Seleccionar vehículo --</option>';
    vehiculos.forEach(function(v) {
        // Template literal (Requisito 9)
        html += `<option value="${v.id}">${v.placa} - ${v.marca} ${v.modelo}</option>`;
    });
    select.innerHTML = html;
}

/**
 * Función: actualizarListaMantenimientos
 * Actualiza la tabla de mantenimientos
 */
function actualizarListaMantenimientos() {
    document.getElementById('total-mantenimientos').textContent = mantenimientos.length;

    const container = document.getElementById('tabla-mantenimientos');
    if (mantenimientos.length === 0) {
        container.innerHTML = '<p class="empty-state">No hay mantenimientos registrados aún.</p>';
        return;
    }

    // Método de array: slice() + reverse() para mostrar los más recientes primero
    const ordenados = [...mantenimientos].reverse();
    let html = '<div class="tabla-container"><table class="tabla">';
    html += '<thead><tr><th>Vehículo</th><th>Tipo</th><th>Fecha</th><th>Kilometraje</th><th>Costo</th><th>Descripción</th></tr></thead>';
    html += '<tbody>';

    ordenados.forEach(function(m) {
        const vehiculo = vehiculos.find(function(v) { return v.id === m.vehiculoId; });
        const placaVehiculo = vehiculo ? vehiculo.placa : 'N/A';
        html += `
            <tr>
                <td><strong>${placaVehiculo}</strong></td>
                <td><span class="badge badge-mant-${m.tipo}">${m.tipo}</span></td>
                <td>${formatearFecha(m.fecha)}</td>
                <td>${m.kilometraje.toLocaleString()} km</td>
                <td><strong>${formatearMoneda(m.costo)}</strong></td>
                <td class="descripcion-cell">${m.descripcion}</td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

/**
 * Función: calcularAlertas
 * Calcula las alertas de todos los vehículos
 * @returns {Array} - Array de objetos con datos de alerta
 */
function calcularAlertas() {
    return vehiculos.map(function(v) {
        // Buscar mantenimientos del vehículo
        // Método de array: filter() + sort() (Requisito 11)
        const mantVehiculo = mantenimientos
            .filter(function(m) { return m.vehiculoId === v.id; })
            .sort(function(a, b) { return new Date(b.fecha).getTime() - new Date(a.fecha).getTime(); });

        const ultimoMant = mantVehiculo[0];
        const mesesSinMant = ultimoMant
            ? mesesTranscurridos(ultimoMant.fecha)
            : mesesTranscurridos(v.fechaRegistro);
        const kmFaltantes = calcularKmFaltantes(v.kilometraje);
        const nivel = determinarAlerta(kmFaltantes, mesesSinMant);

        return {
            vehiculo: v,
            kmFaltantes: kmFaltantes,
            mesesSinMant: mesesSinMant,
            nivel: nivel,
            proximoKm: calcularProximoMantenimientoKm(v.kilometraje),
            costoEstimado: calcularCostoEstimado(v.kilometraje, v.anio)
        };
    });
}

/**
 * Función: actualizarAlertas
 * Actualiza la sección de alertas
 */
function actualizarAlertas() {
    const container = document.getElementById('contenido-alertas');

    if (vehiculos.length === 0) {
        container.innerHTML = '<div class="empty-panel"><p class="empty-state">No hay vehículos registrados. Agregue vehículos para ver alertas.</p></div>';
        return;
    }

    const alertas = calcularAlertas();
    const criticas = alertas.filter(function(a) { return a.nivel === 'critico'; });
    const advertencia = alertas.filter(function(a) { return a.nivel === 'advertencia'; });
    const ok = alertas.filter(function(a) { return a.nivel === 'ok'; });

    let html = '';

    // Alertas críticas
    if (criticas.length > 0) {
        html += '<div class="panel panel-danger">';
        html += `<h3>🔴 Mantenimiento Crítico (${criticas.length})</h3>`;
        html += '<p class="panel-desc">Estos vehículos requieren atención inmediata.</p>';
        html += '<div class="alertas-grid">';
        criticas.forEach(function(a) {
            html += generarCardAlerta(a, 'critico', 'CRÍTICO');
        });
        html += '</div></div>';
    }

    // Alertas de advertencia
    if (advertencia.length > 0) {
        html += '<div class="panel panel-warning">';
        html += `<h3>🟡 Próximo Mantenimiento (${advertencia.length})</h3>`;
        html += '<p class="panel-desc">Planifique el mantenimiento de estos vehículos pronto.</p>';
        html += '<div class="alertas-grid">';
        advertencia.forEach(function(a) {
            html += generarCardAlerta(a, 'advertencia', 'ADVERTENCIA');
        });
        html += '</div></div>';
    }

    // Vehículos OK
    html += '<div class="panel panel-success">';
    html += `<h3>🟢 Vehículos en Buen Estado (${ok.length})</h3>`;
    if (ok.length === 0) {
        html += '<p class="empty-state">No hay vehículos en estado óptimo actualmente.</p>';
    } else {
        html += '<div class="alertas-grid">';
        ok.forEach(function(a) {
            html += generarCardAlerta(a, 'ok', 'OK');
        });
        html += '</div>';
    }
    html += '</div>';

    container.innerHTML = html;
}

/**
 * Función: generarCardAlerta
 * Genera el HTML de una tarjeta de alerta
 * @param {Object} alerta - Datos de la alerta
 * @param {string} clase - Clase CSS
 * @param {string} texto - Texto del badge
 * @returns {string} - HTML de la tarjeta
 */
function generarCardAlerta(alerta, clase, texto) {
    // Template literal (Requisito 9)
    return `
        <div class="alerta-card alerta-${clase}">
            <div class="alerta-header">
                <strong class="alerta-placa">${alerta.vehiculo.placa}</strong>
                <span class="alerta-badge ${clase}">${texto}</span>
            </div>
            <p class="alerta-vehiculo">${alerta.vehiculo.marca} ${alerta.vehiculo.modelo} (${alerta.vehiculo.anio})</p>
            <div class="alerta-detalles">
                <div class="alerta-dato">
                    <span>Km faltantes:</span>
                    <strong>${alerta.kmFaltantes} km</strong>
                </div>
                <div class="alerta-dato">
                    <span>Meses sin mant.:</span>
                    <strong>${alerta.mesesSinMant} meses</strong>
                </div>
                <div class="alerta-dato">
                    <span>Próximo servicio:</span>
                    <strong>${alerta.proximoKm.toLocaleString()} km</strong>
                </div>
                <div class="alerta-dato">
                    <span>Costo estimado:</span>
                    <strong>${formatearMoneda(alerta.costoEstimado)}</strong>
                </div>
            </div>
        </div>
    `;
}

/**
 * Función: actualizarCostos
 * Actualiza la sección de costos
 */
function actualizarCostos() {
    // Calcular totales
    // Método de array: map() + reduce() (Requisito 11)
    const costosArray = mantenimientos.map(function(m) { return m.costo; });
    const costoTotal = costosArray.reduce(function(acc, c) { return acc + c; }, 0);
    const costoPromedio = calcularPromedioCostos(costosArray);
    // Math.max y Math.min (Requisito 16)
    const costoMaximo = costosArray.length > 0 ? Math.max.apply(null, costosArray) : 0;
    const costoMinimo = costosArray.length > 0 ? Math.min.apply(null, costosArray) : 0;

    // Tarjetas de costos
    const cardsContainer = document.getElementById('costos-cards');
    cardsContainer.innerHTML = `
        <div class="card card-primary">
            <div class="card-icon">💰</div>
            <div class="card-data">
                <span class="card-label">Costo Total</span>
                <strong class="card-value">${formatearMoneda(costoTotal)}</strong>
            </div>
        </div>
        <div class="card card-success">
            <div class="card-icon">📊</div>
            <div class="card-data">
                <span class="card-label">Promedio</span>
                <strong class="card-value">${formatearMoneda(costoPromedio)}</strong>
            </div>
        </div>
        <div class="card card-warning">
            <div class="card-icon">📈</div>
            <div class="card-data">
                <span class="card-label">Máximo</span>
                <strong class="card-value">${formatearMoneda(costoMaximo)}</strong>
            </div>
        </div>
        <div class="card card-info">
            <div class="card-icon">📉</div>
            <div class="card-data">
                <span class="card-label">Mínimo</span>
                <strong class="card-value">${formatearMoneda(costoMinimo)}</strong>
            </div>
        </div>
    `;

    // Tabla de costos por vehículo
    const tablaContainer = document.getElementById('tabla-costos');
    if (vehiculos.length === 0) {
        tablaContainer.innerHTML = '<p class="empty-state">No hay datos para mostrar.</p>';
    } else {
        let html = '<div class="tabla-container"><table class="tabla">';
        html += '<thead><tr><th>Vehículo</th><th>Mantenimientos</th><th>Costo Total</th><th>Costo Promedio</th><th>Costo Estimado Próx.</th></tr></thead>';
        html += '<tbody>';
        vehiculos.forEach(function(v) {
            const mantVehiculo = mantenimientos.filter(function(m) { return m.vehiculoId === v.id; });
            const totalVehiculo = mantVehiculo.reduce(function(acc, m) { return acc + m.costo; }, 0);
            const promVehiculo = calcularPromedioCostos(mantVehiculo.map(function(m) { return m.costo; }));
            const costoEst = calcularCostoEstimado(v.kilometraje, v.anio);
            html += `
                <tr>
                    <td><strong>${v.placa}</strong> - ${v.marca} ${v.modelo}</td>
                    <td>${mantVehiculo.length}</td>
                    <td>${formatearMoneda(totalVehiculo)}</td>
                    <td>${formatearMoneda(promVehiculo)}</td>
                    <td>${formatearMoneda(costoEst)}</td>
                </tr>
            `;
        });
        html += '</tbody></table></div>';
        tablaContainer.innerHTML = html;
    }

    // Proyección
    const proyeccionContainer = document.getElementById('proyeccion-costos');
    const alertas = calcularAlertas();
    const alertasNoOk = alertas.filter(function(a) { return a.nivel !== 'ok'; });
    const costoProyectado = alertasNoOk.reduce(function(acc, a) { return acc + a.costoEstimado; }, 0);

    let proyeccionHtml = '<div class="proyeccion-info">';
    proyeccionHtml += `<p>Basado en el análisis predictivo, se estiman <strong>${alertasNoOk.length}</strong> mantenimientos en los próximos 3 meses con un costo estimado total de <strong>${formatearMoneda(costoProyectado)}</strong>.</p>`;

    if (alertasNoOk.length > 0) {
        proyeccionHtml += '<div class="proyeccion-grid">';
        alertasNoOk.forEach(function(a) {
            proyeccionHtml += `
                <div class="proyeccion-item">
                    <span class="proyeccion-placa">${a.vehiculo.placa}</span>
                    <span class="proyeccion-costo">${formatearMoneda(a.costoEstimado)}</span>
                </div>
            `;
        });
        proyeccionHtml += '</div>';
    }
    proyeccionHtml += '</div>';
    proyeccionContainer.innerHTML = proyeccionHtml;
}

// ============================================================
// EVENTOS (Requisito 14)
// ============================================================

/**
 * Configuración de eventos al cargar la página
 * Eventos utilizados:
 * - submit: Formularios de registro
 * - click: Botones de navegación y eliminación
 * - change: Selects (actualización en tiempo real)
 * - input: Campos de texto (validación en tiempo real)
 */
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos guardados
    cargarDatos();

    // Evento submit: Formulario de vehículo
    const formVehiculo = document.getElementById('form-vehiculo');
    if (formVehiculo) {
        formVehiculo.addEventListener('submit', registrarVehiculo);
    }

    // Evento submit: Formulario de mantenimiento
    const formMantenimiento = document.getElementById('form-mantenimiento');
    if (formMantenimiento) {
        formMantenimiento.addEventListener('submit', registrarMantenimiento);
    }

    // Evento input: Validación en tiempo real de la placa
    const placaInput = document.getElementById('placa');
    if (placaInput) {
        // Evento input (Requisito 14)
        placaInput.addEventListener('input', function() {
            // Método de string: .toUpperCase() + .replace() (Requisito 8)
            // .replace() con regex: reemplaza caracteres no válidos
            this.value = this.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        });
    }

    // Evento change: Select de tipo de vehículo
    const tipoSelect = document.getElementById('tipo');
    if (tipoSelect) {
        // Evento change (Requisito 14)
        tipoSelect.addEventListener('change', function() {
            console.log('Tipo de vehículo seleccionado:', this.value);
        });
    }

    // Evento click: Botones de navegación (ya están en el HTML con onclick)
    // Pero también agregamos listeners para el evento change en selects de mantenimiento
    const mantVehiculoSelect = document.getElementById('mant-vehiculo');
    if (mantVehiculoSelect) {
        mantVehiculoSelect.addEventListener('change', function() {
            const vehiculoId = parseInt(this.value);
            if (vehiculoId) {
                const vehiculo = vehiculos.find(function(v) { return v.id === vehiculoId; });
                if (vehiculo) {
                    // Autocompletar kilometraje
                    const kmInput = document.getElementById('mant-km');
                    if (kmInput) kmInput.value = vehiculo.kilometraje;
                }
            }
        });
    }

    // Actualizar vista inicial
    actualizarVista();

    // Mensaje de bienvenida
    console.log('🚛 FleetCare - Sistema de Gestión de Flotas cargado correctamente.');
    console.log('📋 Requisitos cumplidos: Variables, tipos, operaciones matemáticas,');
    console.log('   comparaciones, lógicos, condicionales, funciones, strings,');
    console.log('   template literals, regex, arrays, objetos, spread, eventos,');
    console.log('   DOM, Math, validación, mensajes, try-catch.');
});
