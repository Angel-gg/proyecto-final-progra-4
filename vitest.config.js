import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Entorno de Node (no necesitamos DOM para tests unitarios puros)
    environment: 'node',
    globals: true,
    // Alias para resolver @/ igual que Next.js
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Reporte de cobertura
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/lib/**/*.js'],
      exclude: ['src/lib/prisma.js'],
      thresholds: {
        lines:      70,
        functions:  70,
        branches:   60,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
