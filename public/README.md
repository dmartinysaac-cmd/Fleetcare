# 🚛 FleetCare – Sistema Web para Gestión y Mantenimiento Predictivo de Flotas Vehiculares

## 📋 Descripción del Proyecto

**FleetCare** es un sistema web diseñado para la gestión inteligente de flotas vehiculares. Permite a empresas de transporte registrar sus vehículos, llevar un control de mantenimientos, y recibir alertas predictivas basadas en kilometraje y tiempo transcurrido.

### Problemática
Una empresa de transporte gestiona su flota mediante hojas de cálculo, lo que genera:
- Dificultad para predecir cuándo toca mantenimiento
- Pérdida de información sobre costos
- Sin alertas automáticas
- Sin control del estado de cada vehículo

### Solución
Plataforma web que centraliza toda la información y automatiza:
- Registro de vehículos con validación de placa peruana
- Registro de mantenimientos y reparaciones
- Cálculo predictivo del próximo mantenimiento
- Alertas automáticas según nivel de urgencia
- Análisis financiero de costos

---

## 🚀 Cómo Ejecutar

### Opción 1: Archivos estáticos (HTML + CSS + JS puro)
1. Abrir el archivo `public/index.html` directamente en un navegador
2. O servir los archivos de `public/` con cualquier servidor web estático

```bash
# Con Python
cd public && python -m http.server 8000

# Con Node.js
npx serve public
```

### Opción 2: Versión React (build del proyecto)
```bash
npm install
npm run build
# Los archivos se generan en dist/
```

---

## ✅ Lista de Requisitos Cumplidos

### Estructura de archivos
- [x] `index.html` - Estructura HTML semántica
- [x] `css/estilos.css` - Estilos CSS completos
- [x] `js/app.js` - Lógica JavaScript pura
- [x] `README.md` - Documentación del proyecto

### ETAPA 3 - HTML
- [x] h1, h2, h3 - Títulos jerárquicos
- [x] p, span, strong - Elementos de texto
- [x] form, label, input, select, option, textarea, button - Formularios
- [x] section, div - Contenedores semánticos
- [x] Formulario de registro de vehículos
- [x] Formulario de registro de mantenimientos

### ETAPA 4 - CSS
- [x] color, background-color
- [x] font-family, font-size, font-weight
- [x] margin, padding
- [x] border, border-radius
- [x] width, max-width
- [x] text-align
- [x] Diseño tipo dashboard profesional (azul oscuro, verde, gris)
- [x] Diseño responsive

### ETAPA 5 - JavaScript

| # | Requisito | Dónde se cumple |
|---|-----------|-----------------|
| 1 | Variables y constantes (`let`, `const`) | Todo el archivo: `let vehiculos = []`, `const INTERVALO_MANTENIMIENTO_KM = 10000` |
| 2 | Tipos de datos (string, number, boolean, array, object) | Objetos vehículo, arrays, números, strings, booleanos en validaciones |
| 3 | 3+ operaciones matemáticas | `calcularProximoMantenimientoKm()`, `calcularCostoEstimado()`, `calcularPromedioCostos()`, `calcularKmFaltantes()` |
| 4 | Operadores de comparación (`>`, `<`, `>=`, `<=`, `===`, `!==`) | `determinarAlerta()`, validaciones en `registrarVehiculo()` |
| 5 | Operadores lógicos (`&&`, `\|\|`, `!`) | `determinarAlerta()`: `kmFaltantes <= 500 \|\| mesesSinMantenimiento >= 6` |
| 6 | Condicionales (`if`, `else`, `else if`) | `determinarAlerta()`, validaciones en formularios |
| 7 | Funciones propias | `validarPlaca()`, `calcularProximoMantenimientoKm()`, `calcularCostoEstimado()`, `calcularPromedioCostos()`, `determinarAlerta()`, `formatearMoneda()`, `formatearFecha()`, `mesesTranscurridos()`, `generarId()`, `capitalizar()`, `mostrarMensaje()`, `guardarDatos()`, `cargarDatos()`, `registrarVehiculo()`, `registrarMantenimiento()`, `eliminarVehiculo()`, `cambiarSeccion()`, `actualizarVista()`, etc. |
| 8 | 5+ métodos de strings | `toUpperCase()`, `toLowerCase()`, `trim()`, `includes()`, `slice()`, `replace()`, `length`, `split()`, `charAt()` |
| 9 | Template literals | `` `S/ ${monto.toLocaleString('es-PE')}` ``, `` `✅ Vehículo ${placa} registrado` `` |
| 10 | Expresión regular | `REGEX_PLACA_PERUANA = /^[A-Z]{3}-\d{3}$\|^[A-Z]{2}-\d{4}$/` |
| 11 | Arreglo + operaciones | `vehiculos.map()`, `vehiculos.filter()`, `vehiculos.find()`, `vehiculos.some()`, `costos.reduce()`, `array.slice()`, `array.reverse()`, `array.sort()` |
| 12 | Objeto entidad | `{ id, placa, marca, modelo, anio, kilometraje, tipo, fechaRegistro }` |
| 13 | Operador Spread (`...`) | `vehiculos = [...vehiculos, nuevoVehiculo]`, `{ ...v, kilometraje: nuevo }`, `[...mantenimientos].reverse()` |
| 14 | Eventos | `submit` (formularios), `click` (navegación, eliminar), `change` (selects), `input` (validación placa) |
| 15 | Manipulación DOM | `innerHTML`, `textContent`, `value`, `classList.add/remove`, `style.display`, `querySelector`, `querySelectorAll` |
| 16 | 3+ métodos de Math | `Math.ceil()`, `Math.round()`, `Math.floor()`, `Math.max()`, `Math.min()`, `Math.random()` |
| 17 | Validación de datos | Validación de placa, año, kilometraje, campos vacíos, costo negativo, longitud de descripción |
| 18 | Mensajes claros | `mostrarMensaje()` con tipos: éxito, error, info |
| 19 | try-catch | `guardarDatos()` y `cargarDatos()` con manejo de errores |

---

## 🔍 Explicación del Operador Spread (`...`)

El **operador spread** (`...`) se utiliza en FleetCare para crear copias de arrays y objetos de forma **inmutable** (sin modificar los originales).

### Uso en arrays:
```javascript
// Agregar un vehículo al array sin modificar el original
vehiculos = [...vehiculos, nuevoVehiculo];

// Crear copia invertida del array
const ordenados = [...mantenimientos].reverse();
```

**¿Para qué sirve?** En lugar de usar `push()` que modifica el array original, el spread crea un **nuevo array** combinando los elementos existentes con el nuevo. Esto es una buena práctica porque:
- No muta el estado anterior
- Facilita el seguimiento de cambios
- Es más predecible en aplicaciones complejas

### Uso en objetos:
```javascript
// Actualizar kilometraje del vehículo sin perder otras propiedades
return { ...v, kilometraje: Math.max(v.kilometraje, kilometraje) };
```

**¿Para qué sirve?** Copia todas las propiedades del objeto `v` y solo sobrescribe `kilometraje`. Así no perdemos `placa`, `marca`, `modelo`, etc.

---

## 🔍 Explicación de la Expresión Regular

```javascript
const REGEX_PLACA_PERUANA = /^[A-Z]{3}-\d{3}$|^[A-Z]{2}-\d{4}$/;
```

### ¿Qué valida?
Esta expresión regular valida el formato de **placas vehiculares peruanas** en sus dos formatos vigentes:

| Formato | Ejemplo | Patrón |
|---------|---------|--------|
| Placa nueva (2016+) | `ABC-123` | `[A-Z]{3}-\d{3}` |
| Placa antigua | `AB-1234` | `[A-Z]{2}-\d{4}` |

### Desglose:
- `^` → Inicio del string
- `[A-Z]{3}` → Exactamente 3 letras mayúsculas
- `-` → Guión literal
- `\d{3}` → Exactamente 3 dígitos
- `$` → Fin del string
- `|` → OR (permite cualquiera de los dos formatos)

### Uso en el código:
```javascript
function validarPlaca(placa) {
    const placaLimpia = placa.trim().toUpperCase();
    return REGEX_PLACA_PERUANA.test(placaLimpia);
}
```

---

## 📊 Funcionalidades del Sistema

1. **📊 Dashboard** - Panel con resumen general de la flota
2. **🚗 Registro de Vehículos** - Formulario con validación de placa peruana
3. **🔧 Registro de Mantenimientos** - Control de servicios realizados
4. **⚠️ Alertas Predictivas** - Sistema automático basado en km y tiempo
5. **💰 Resumen de Costos** - Análisis financiero con proyecciones

### Lógica de Alertas:
- 🔴 **Crítico**: Faltan ≤500 km para mantenimiento O han pasado ≥6 meses
- 🟡 **Advertencia**: Faltan ≤2000 km O han pasado ≥4 meses
- 🟢 **OK**: Vehículo en buen estado

---

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Diseño responsive tipo dashboard
- **JavaScript (ES6+)** - Lógica de negocio pura
- **LocalStorage** - Persistencia de datos en el navegador

---

## 📝 Autor

Proyecto universitario – Desarrollo Web con JavaScript
