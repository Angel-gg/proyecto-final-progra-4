# Documentación del Diseño Digital y de Software
## Estación de Servicio "El Surtidor Cochabambino"

Esta documentación detalla los fundamentos de **Sistemas Digitales (SD)** y de **Ingeniería de Software** aplicados en el proyecto final.

---

## 1. Diseño Lógico de Sensores de Nivel (S1, S0)

El nivel de almacenamiento del combustible en cada surtidor se monitoriza digitalmente utilizando **dos sensores binarios (S₁, S₀)**, capaces de representar 4 estados lógicos (2² = 4).

### Tabla de Verdad de Niveles y LEDs

| Entrada (S₁) | Entrada (S₀) | Porcentaje de Nivel | Estado / LED Activo | Mintermino |
| :---: | :---: | :---: | :---: | :---: |
| 0 | 0 | 0% - 25% | **Crítico / LED Rojo** | m₀ |
| 0 | 1 | 25% - 50% | **Bajo / LED Amarillo** | m₁ |
| 1 | 0 | 50% - 75% | **Normal-Medio / LED Verde** | m₂ |
| 1 | 1 | 75% - 100% | **Normal-Lleno / LED Verde** | m₃ |

---

## 2. Compuertas Lógicas Implementadas

El sistema implementa compuertas lógicas en código JavaScript puro como funciones exportables:

| Compuerta | Función JS | Expresión Booleana | Uso en el sistema |
|:---:|:---:|:---:|:---|
| AND  | `AND(a, b) = a && b` | A·B | Combinar NOT S1 con S0 para LED Amarillo |
| OR   | `OR(a, b) = a \|\| b` | A+B | Base de NOR |
| NOT  | `NOT(a) = !a` | A' | Inversión de señales |
| **NAND** | `NAND(a, b) = !(a && b)` | **(A·B)'** | **Inversor universal → LED Rojo** |
| **NOR**  | `NOR(a, b) = !(a \|\| b)` | **(A+B)'** | **Verificación LED Rojo (m₀)** |
| XNOR | `XNOR(a, b) = a === b` | (A⊕B)' | Equivalencia lógica |

> **Propiedad Universal de NAND**: Cualquier función lógica puede implementarse solo con compuertas NAND.
> `NAND(x, x) = NOT(x)` — Se usa NAND como inversor para S1 y S0.

---

## 3. Simplificación y Mapas de Karnaugh

Para controlar la activación de las alertas físicas (LEDs) se diseñaron circuitos lógicos combinacionales utilizando minterminos.

### A. LED Rojo (F_rojo — Nivel Crítico) — m₀

Se activa únicamente cuando el tanque está críticamente bajo (código `00`):

**Mapa de Karnaugh:**
```
      S0
S1 \   0    1
    +----+----+
 0  |  1 |  0 |  ← m₀ activo
    +----+----+
 1  |  0 |  0 |
    +----+----+
```

**Implementación con NAND Universal:**
```
notS1 = NAND(S1, S1)          → NOT(S1) = S1'
notS0 = NAND(S0, S0)          → NOT(S0) = S0'
LED_Rojo = AND(notS1, notS0)  → S1'·S0'
Verificación: NOR(S1, S0)     → (S1+S0)' = S1'·S0' ✓
```

* **Expresión Simplificada**: `F_rojo = S1'·S0' = NOR(S1, S0)`
* **Compuerta NAND Universal**: `NAND(NAND(S1,S1), NAND(S0,S0))` → `S1'·S0'`

---

### B. LED Amarillo (F_amarillo — Nivel Bajo) — m₁

Se activa únicamente cuando el nivel está entre el 25% y 50% (código `01`):

**Mapa de Karnaugh:**
```
      S0
S1 \   0    1
    +----+----+
 0  |  0 |  1 |  ← m₁ activo
    +----+----+
 1  |  0 |  0 |
    +----+----+
```

* **Expresión Lógica**: `F_amarillo = S1'·S0 = AND(NOT S1, S0)`
* **Compuerta**: AND con entrada S1 negada

---

### C. LED Verde (F_verde — Nivel Normal/Lleno) — m₂ + m₃

Se activa si el tanque está en niveles óptimos (códigos `10` o `11`):

**Simplificación por Álgebra de Boole:**
```
F_verde = S1·S0' + S1·S0
        = S1·(S0' + S0)     [factor común S1]
        = S1·1               [S0'+S0 = 1, ley del complemento]
        = S1
```

* **Expresión Simplificada**: `F_verde = S1`
* **Implementación**: Conexión directa del bit más significativo S1 en estado alto.

---

## 4. Decodificador de Combustibles (2 bits)

Se utiliza un decodificador de 2 bits para asignar los combustibles disponibles:

| Código Binario | Línea Activa | Combustible Asignado | Precio Oficial |
| :---: | :---: | :---: | :---: |
| `00` | D₀ | Gasolina Especial | Bs. 3.74 |
| `01` | D₁ | Diesel Oil | Bs. 3.72 |
| `10` | D₂ | Gasolina Premium Ultra | Bs. 4.79 |
| `11` | D₃ | GNV Vehicular | Bs. 1.66 / m³ |

El **Patrón Strategy** (`PrecioStrategy.js`) encapsula esta tabla como estrategias intercambiables, una por cada tipo de combustible. `PrecioContext.getStrategy(combustible)` selecciona automáticamente la estrategia correcta.

---

## 5. Aritmética Binaria para Cálculo de Ventas

El sistema realiza el cálculo del importe en base decimal:
```
Total (Bs.) = Litros × Precio por Litro
```

Luego convierte a **Coma Fija Binaria** para registrar en BD y mostrar en la UI (campo `totalBinario`):

1. **Parte Entera**: Conversión mediante `Number.toString(2)` (divisiones sucesivas por 2).
2. **Parte Fraccionaria**: Multiplicaciones sucesivas por 2 (máx 6 bits de resolución).

**Ejemplo completo:**
```
Total: Bs. 149.60
  Parte entera: 149 → 10010101₂
  Fracción: 0.60:
    0.60 × 2 = 1.20 → 1
    0.20 × 2 = 0.40 → 0
    0.40 × 2 = 0.80 → 0
    0.80 × 2 = 1.60 → 1
    0.60 × 2 = 1.20 → 1  (ciclo)
    0.20 × 2 = 0.40 → 0
  Fracción: 100110₂

Resultado final: 10010101.100110₂
```

---

## 6. Patrones de Diseño Implementados

### 6.1 Factory (Creacional) — `SurtidorFactory`
Centraliza la construcción de objetos Surtidor con:
- Validación de datos (número positivo, nivel ≤ capacidad, combustible válido)
- Cálculo automático de `codigoBinario` via `calcularBinarioNivel()`
- Determinación de `estado` (OPERATIVO / ALERTA) via K-Map

### 6.2 Adapter (Estructural) — `PrismaAdapter`
Desacopla las rutas API del ORM mediante:
- Interfaz `DatabasePort` (contrato abstracto)
- `PrismaAdapter` implementa el contrato con Prisma
- Transacciones atómicas en `registrarVentaConActualizacion()`
- Cambiar a Supabase = crear `SupabaseAdapter` sin modificar rutas

### 6.3 Observer (Comportamiento) — `NivelSurtidorSubject`
Sistema reactivo de alertas:
- `NivelSurtidorSubject.notify()` se llama al cambiar nivel
- `AlertaPersistenciaObserver.update()` guarda/resuelve alertas en BD
- `LogObserver.update()` registra eventos en consola

### 6.4 Strategy (Comportamiento) — `PrecioContext`
Cálculo de precios encapsulado por tipo de combustible:
- Una estrategia por combustible (4 en total)
- `PrecioContext.getStrategy(nombre)` selecciona automáticamente
- Los códigos binarios de estrategia coinciden con el decodificador de combustible

---

## 7. Arquitectura de Software

```mermaid
graph TD
    A[layout.jsx / Toaster Sonner] --> B[page.jsx / Dashboard Principal]
    B --> C[Sidebar.jsx + Web Speech API]
    B --> D[MetricCard.jsx]
    B --> E[SurtidorCard.jsx]
    B --> F[KarnaughMap.jsx]
    B --> G[CircuitDiagram.jsx SVG NAND/NOR]
    B --> H[VentaModal.jsx]
    B --> I[SurtidorModal.jsx]
    B --> J[/api/surtidores]
    B --> K[/api/ventas]
    B --> L[/api/alertas]
    J --> M[SurtidorFactory]
    J --> N[PrismaAdapter]
    J --> O[NivelSurtidorSubject]
    K --> P[PrecioContext Strategy]
    K --> N
    K --> O
    L --> N
    M --> DS[digitalSystems.js]
    N --> Q[Prisma ORM]
    Q --> R[(SQLite dev.db)]
    DS --> E
    DS --> G
    DS --> H
    DS --> I
```

### Componentes de UI

| Componente | Responsabilidad |
|---|---|
| `Sidebar.jsx` | Navegación principal + Widget de Web Speech API (comandos de voz) |
| `MetricCard.jsx` | KPIs del dashboard (ingresos, litros, surtidores, alertas) |
| `SurtidorCard.jsx` | Tarjeta de surtidor con barra de nivel animada y código binario en tiempo real |
| `KarnaughMap.jsx` | Visualización del Mapa K 2×2 con mintermino resaltado |
| `CircuitDiagram.jsx` | Diagrama SVG animado del circuito NAND/NOR con señales coloreadas en tiempo real |
| `VentaModal.jsx` | Formulario de nueva venta con preview de aritmética binaria en tiempo real |
| `SurtidorModal.jsx` | Formulario crear/editar surtidor con preview de sensor binario en tiempo real |
