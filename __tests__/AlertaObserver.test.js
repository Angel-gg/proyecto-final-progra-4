/**
 * Tests Unitarios: Patrón Observer — Sistema de Alertas
 * ======================================================
 * Verifica el Subject/Observer sin dependencia de BD real (usa mocks).
 *
 * Ejecutar: npx vitest run
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  NivelSurtidorSubject,
  AlertaObserver,
  AlertaPersistenciaObserver,
  LogObserver,
} from '../src/lib/observers/AlertaObserver.js';

// ─── Mock del adapter de BD ───
const mockDb = {
  createAlerta: vi.fn().mockResolvedValue({ id: 1 }),
  resolveAlertasBySurtidor: vi.fn().mockResolvedValue({ count: 0 }),
};

const surtidorMock = { id: 1, numero: 1, nivelLitros: 1000, capacidad: 10000 };

describe('NivelSurtidorSubject — Subject del patrón Observer', () => {

  it('permite registrar y notificar observers', async () => {
    const subject = new NivelSurtidorSubject();
    const updateFn = vi.fn().mockResolvedValue(undefined);

    class TestObserver extends AlertaObserver {
      async update(estado) { return updateFn(estado); }
    }

    subject.subscribe(new TestObserver());
    await subject.notify({ surtidor: surtidorMock, ledRojo: false, ledAmarillo: false, porcentaje: 85 });

    expect(updateFn).toHaveBeenCalledOnce();
    expect(updateFn).toHaveBeenCalledWith(expect.objectContaining({ porcentaje: 85 }));
  });

  it('permite desregistrar un observer', async () => {
    const subject = new NivelSurtidorSubject();
    const updateFn = vi.fn().mockResolvedValue(undefined);

    class TestObserver extends AlertaObserver {
      async update(estado) { return updateFn(estado); }
    }

    const obs = new TestObserver();
    subject.subscribe(obs);
    subject.unsubscribe(obs);

    await subject.notify({ surtidor: surtidorMock, ledRojo: true, ledAmarillo: false, porcentaje: 10 });
    expect(updateFn).not.toHaveBeenCalled();
  });

  it('lanza TypeError si se intenta registrar algo que no es AlertaObserver', () => {
    const subject = new NivelSurtidorSubject();
    expect(() => subject.subscribe({})).toThrow(TypeError);
  });

  it('notifica a múltiples observers simultáneamente', async () => {
    const subject = new NivelSurtidorSubject();
    const calls = [];

    class ObserverA extends AlertaObserver {
      async update() { calls.push('A'); }
    }
    class ObserverB extends AlertaObserver {
      async update() { calls.push('B'); }
    }

    subject.subscribe(new ObserverA());
    subject.subscribe(new ObserverB());

    await subject.notify({ surtidor: surtidorMock, ledRojo: false, ledAmarillo: false, porcentaje: 80 });

    expect(calls).toContain('A');
    expect(calls).toContain('B');
    expect(calls).toHaveLength(2);
  });
});

describe('AlertaPersistenciaObserver — Observer Concreto', () => {
  beforeEach(() => {
    mockDb.createAlerta.mockClear();
    mockDb.resolveAlertasBySurtidor.mockClear();
  });

  it('llama a createAlerta con tipo CRITICO cuando ledRojo es true', async () => {
    const observer = new AlertaPersistenciaObserver(mockDb);
    await observer.update({ surtidor: surtidorMock, ledRojo: true, ledAmarillo: false, porcentaje: 15 });

    expect(mockDb.createAlerta).toHaveBeenCalledOnce();
    const call = mockDb.createAlerta.mock.calls[0][0];
    expect(call.tipo).toBe('CRITICO');
    expect(call.logicaKarnaugh).toContain('[00]');
  });

  it('llama a createAlerta con tipo BAJO cuando ledAmarillo es true', async () => {
    const observer = new AlertaPersistenciaObserver(mockDb);
    await observer.update({ surtidor: surtidorMock, ledRojo: false, ledAmarillo: true, porcentaje: 35 });

    expect(mockDb.createAlerta).toHaveBeenCalledOnce();
    const call = mockDb.createAlerta.mock.calls[0][0];
    expect(call.tipo).toBe('BAJO');
    expect(call.logicaKarnaugh).toContain('[01]');
  });

  it('llama a resolveAlertasBySurtidor cuando el nivel es normal', async () => {
    const observer = new AlertaPersistenciaObserver(mockDb);
    await observer.update({ surtidor: surtidorMock, ledRojo: false, ledAmarillo: false, porcentaje: 80 });

    expect(mockDb.resolveAlertasBySurtidor).toHaveBeenCalledWith(surtidorMock.id);
    expect(mockDb.createAlerta).not.toHaveBeenCalled();
  });
});

describe('LogObserver — Observer de Consola', () => {
  it('no lanza errores al recibir cualquier estado', async () => {
    const observer = new LogObserver();
    await expect(
      observer.update({ surtidor: surtidorMock, ledRojo: true, ledAmarillo: false, porcentaje: 10 })
    ).resolves.not.toThrow();

    await expect(
      observer.update({ surtidor: surtidorMock, ledRojo: false, ledAmarillo: true, porcentaje: 35 })
    ).resolves.not.toThrow();

    await expect(
      observer.update({ surtidor: surtidorMock, ledRojo: false, ledAmarillo: false, porcentaje: 85 })
    ).resolves.not.toThrow();
  });
});
