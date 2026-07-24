# El Surtidor Cochabambino 🛢️⚡
### Sistema Digital de Control y Gestión de Surtidores de Gasolina

> Proyecto Final — Programación 4 | Aplicación con lógica de **Sistemas Digitales**, **Mapas de Karnaugh** y **Patrones de Diseño GoF**

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Base de Datos | SQLite (Prisma ORM) |
| UI | React 18 + Vanilla CSS |
| Deploy | Vercel |
| Testing | Vitest |
| Análisis | SonarQube |

---

## 🏗️ Patrones de Diseño Implementados

### Patrón Creacional — Factory (`SurtidorFactory`)
Centraliza la construcción de objetos `Surtidor`, aplicando:
- Validaciones de entrada (número positivo, nivel vs capacidad, combustible válido)
- Cálculos automáticos de código binario SD (2 bits)
- Determinación de estado (`OPERATIVO` / `ALERTA`)

```
src/lib/factories/SurtidorFactory.js
```

### Patrón Estructural — Adapter (`PrismaAdapter`)
Desacopla las rutas API del ORM mediante una interfaz (`DatabasePort`):
- Las rutas solo conocen la abstracción, no Prisma directamente
- Cambiar de SQLite a Supabase/PostgreSQL = crear `SupabaseAdapter` sin tocar rutas
- Incluye `registrarVentaConActualizacion()` para transacciones atómicas

```
src/lib/adapters/DatabaseAdapter.js   ← Interfaz / Port
src/lib/adapters/PrismaAdapter.js     ← Implementación Prisma
```

### Patrón de Comportamiento — Observer (`AlertaObserver`)
Sistema reactivo de alertas desacoplado:
- `NivelSurtidorSubject` — publica cambios de nivel tras cada venta/edición
- `AlertaPersistenciaObserver` — persiste alertas en BD según lógica de Karnaugh
- `LogObserver` — registra eventos en consola para depuración

```
src/lib/observers/AlertaObserver.js
```

---

## 🔢 Sistemas Digitales Aplicados

| Concepto SD | Implementación |
|---|---|
| Sensor de Nivel (2 bits) | `calcularBinarioNivel(%)` → `00/01/10/11` |
| Mapas de Karnaugh | `evaluarLogicaAlertas(código)` → LEDs Rojo/Amarillo/Verde |
| Aritmética Binaria | `decimalABinario(número)` → coma fija 6 bits fraccionarios |
| Decodificador Combustible | 2 bits: 00=Gasolina, 01=Diesel, 10=Premium, 11=GNV |

---

## 🧪 Tests Unitarios

```bash
# Ejecutar todos los tests
npm test

# Modo watch durante desarrollo
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

**Cobertura objetivo: ≥70%** — Módulos testeados:
- `digitalSystems.js` — 18 tests (decodificador, Karnaugh, aritmética binaria)
- `SurtidorFactory.js` — 11 tests (creación válida, validaciones, tipos)
- `AlertaObserver.js` — 10 tests (Subject, Observers, mocks de BD)

---

## 🗄️ Esquema de Base de Datos

```
Surtidor ──< Venta
Surtidor ──< Alerta
```

| Tabla | Campos clave |
|---|---|
| Surtidor | id, numero, combustible, capacidad, nivelLitros, **codigoBinario**, estado |
| Venta | id, fecha, litros, total, **totalBinario**, surtidorId |
| Alerta | id, tipo, **logicaKarnaugh**, estado, surtidorId |

---

## ▶️ Ejecución Local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear y seedear la BD
npm run db:reset

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abrir: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy en Vercel

El proyecto está configurado para deploy automático en Vercel:

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Añadir Variable de Entorno: `DATABASE_URL` = `file:./dev.db`
3. El build command (`prisma generate && next build`) corre automáticamente

> **Nota:** SQLite se incluye con el build. Para persistencia real en producción, se recomienda migrar a Supabase PostgreSQL.

---

## 📊 Análisis SonarQube

```bash
# Requiere SonarQube corriendo en localhost:9000
npx sonar-scanner
```

Configuración en `sonar-project.properties`.

---

## 🖥️ Interfaces

- **Dashboard** — KPIs en tiempo real + últimas ventas
- **Surtidores** — CRUD completo con código binario SD en tiempo real
- **Ventas** — Registro con conversión automática a aritmética binaria
- **Alertas** — Panel con LEDs, expresiones de Karnaugh y estado
- **Reportes** — Tabla de verdad, K-Maps, desglose por combustible

---

*Desarrollado con ❤️ en Cochabamba, Bolivia 🇧🇴*
