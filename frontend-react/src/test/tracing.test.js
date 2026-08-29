import { describe, it, expect } from 'vitest';
import { initTracing } from '../utils/tracing';

describe('Tracing Module', () => {
  it('initTracing is a function', () => {
    expect(typeof initTracing).toBe('function');
  });

  it('initTracing returns a usable Tracer', () => {
    const tracer = initTracing('test-service');
    expect(tracer).toBeTruthy();
    expect(typeof tracer.startSpan).toBe('function');
  });

  it('tracer produces spans with the expected API', () => {
    const tracer = initTracing('test-service');
    const span = tracer.startSpan('test-span');
    expect(typeof span.setAttributes).toBe('function');
    expect(typeof span.recordException).toBe('function');
    expect(typeof span.end).toBe('function');
    span.setAttributes({ 'test.attribute': 'value' });
    span.end();
  });

  it('initTracing is idempotent (safe to call repeatedly)', () => {
    const tracerA = initTracing('service-a');
    const tracerB = initTracing('service-b');
    expect(tracerA).toBeTruthy();
    expect(tracerB).toBeTruthy();
  });
});
