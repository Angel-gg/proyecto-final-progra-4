# Sistema Digital de Control y Gestión para Surtidor de Gasolina en Cochabamba

Aplicación multiplataforma para la gestión integral de la Estación de Servicio **"El Surtidor Cochabambino"**, aplicando conceptos de **Sistemas Digitales** (sensores de nivel en binario `00, 01, 10, 11`, mapas de Karnaugh, compuertas lógicas y aritmética binaria) con una base de datos SQLite y ORM Prisma.

## 🚀 Características
- **Dashboard Interactivo**: Visualización en tiempo real con estética moderna (Glassmorphism, dark mode, indicadores LED animados).
- **Gestión de Surtidores**: Monitoreo de capacidad y nivel con sensores digitales representados en binario (00=vacío, 01=25%, 10=50%, 11=100%).
- **Lógica de Alertas (SD & Karnaugh)**: Monitoreo de niveles bajos (LED amarillo, compuerta AND/NOT `m1`) y críticos (LED rojo, compuerta NOR `m0`).
- **Registro de Ventas**: Cálculo de totales y conversión dinámica a aritmética binaria de punto fijo.
- **APIs Web**: Control de navegación por voz con **Web Speech API** y exportación de reportes al portapapeles con **Clipboard API**.
- **Base de Datos**: SQLite gestionada vía **Prisma ORM**.

## 🛠️ Tecnologías
- **Framework**: Next.js 14 / React
- **Base de Datos**: SQLite con Prisma ORM
- **Estilos**: Vanilla CSS con variables customizables
- **Control de Versiones**: Git & GitHub

## 🏃 Cómo Ejecutar el Proyecto
```bash
# 1. Instalar dependencias
npm install

# 2. Inicializar BD SQLite y ejecutar migraciones
npx prisma db push

# 3. Cargar datos de prueba (Seed)
npm run db:seed

# 4. Iniciar servidor de desarrollo
npm run dev
```

Visita `http://localhost:3000` en tu navegador.
