import test from 'node:test';
import assert from 'node:assert';
import { formatPrometheusMetrics } from '../prometheus_metrics.mjs';

test('Prometheus Metrics Module', async (t) => {
  await t.test('formatPrometheusMetrics is a function', () => {
    assert.strictEqual(typeof formatPrometheusMetrics, 'function');
  });

  await t.test('formatPrometheusMetrics returns string', () => {
    const result = formatPrometheusMetrics();
    assert.strictEqual(typeof result, 'string');
    assert(result.length > 0);
  });

  await t.test('formatPrometheusMetrics includes HELP comments', () => {
    const result = formatPrometheusMetrics();
    assert(result.includes('# HELP'));
    assert(result.includes('# TYPE'));
  });

  await t.test('formatPrometheusMetrics includes uptime metric', () => {
    const result = formatPrometheusMetrics();
    assert(result.includes('exercise_tracker_uptime_seconds'));
  });

  await t.test('formatPrometheusMetrics includes request metrics', () => {
    const result = formatPrometheusMetrics();
    assert(result.includes('http_requests_total'));
    assert(result.includes('http_requests_by_status'));
    assert(result.includes('http_requests_by_method'));
  });

  await t.test('formatPrometheusMetrics includes error metrics', () => {
    const result = formatPrometheusMetrics();
    assert(result.includes('http_errors_total'));
    assert(result.includes('http_errors_4xx_total'));
    assert(result.includes('http_errors_5xx_total'));
  });

  await t.test('formatPrometheusMetrics includes response time metrics', () => {
    const result = formatPrometheusMetrics();
    assert(result.includes('http_response_time_ms'));
    assert(result.includes('http_response_time_ms_count'));
    assert(result.includes('http_response_time_ms_sum'));
  });

  await t.test('formatPrometheusMetrics includes error rate metric', () => {
    const result = formatPrometheusMetrics();
    assert(result.includes('http_error_rate_percent'));
  });

  await t.test('formatPrometheusMetrics follows Prometheus text format', () => {
    const result = formatPrometheusMetrics();
    const lines = result.split('\n').filter((line) => line.trim() !== '');

    // Check for proper metric format
    const metricLines = lines.filter((line) => !line.startsWith('#'));
    assert(metricLines.length > 0);

    metricLines.forEach((line) => {
      // Each metric line should have metric_name{labels} value or metric_name value
      const hasMetricFormat = /^[a-zA-Z_:][a-zA-Z0-9_:]*(\{[^}]*\})?\s+[\d.-]+/.test(line);
      assert(hasMetricFormat, `Invalid Prometheus metric format: ${line}`);
    });
  });

  await t.test('formatPrometheusMetrics escapes quotes in path labels', () => {
    const result = formatPrometheusMetrics();
    // Check that quotes in paths are escaped
    const pathLines = result.split('\n').filter((line) => line.includes('http_requests_by_path'));
    pathLines.forEach((line) => {
      // Should not have unescaped quotes
      const insideBraces = line.match(/\{[^}]*\}/)?.[0];
      if (insideBraces) {
        // Count escaped quotes (should be even)
        const unescapedQuotes = (insideBraces.match(/([^\\]|^)"/g) || []).length;
        assert(unescapedQuotes === 0, `Unescaped quotes found: ${line}`);
      }
    });
  });
});
