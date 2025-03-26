// @src/infrastructure/services/prometheus-lite-service.ts
import { MetricsService } from '@src/core/interfaces/mertric-service';
import { injectable } from 'inversify';
import { Counter, Histogram } from 'prom-client';

@injectable()
export class PrometheusMetricsService implements MetricsService {
  private counters: Record<string, Counter> = {};
  private histograms: Record<string, Histogram> = {};
  private failureCounter: Counter;

  constructor() {
    this.createMetricIfNotExists('session_cleanups_total', 'counter');
    this.createMetricIfNotExists(
      'session_cleanup_duration_seconds',
      'histogram',
    );
    this.failureCounter = new Counter({
      name: 'session_cleanup_failures_total',
      help: 'Total number of failed session cleanup operations',
    });
  }
  recordCleanupFailure(): void {
    this.failureCounter.inc();
  }

  incrementCounter(
    metricName: string,
    tags: Record<string, string> = {},
  ): void {
    this.createMetricIfNotExists(metricName, 'counter');
    this.counters[metricName].inc(tags);
  }

  private createMetricIfNotExists(name: string, type: 'counter' | 'histogram') {
    if (!this.counters[name] && !this.histograms[name]) {
      if (type === 'counter') {
        this.counters[name] = new Counter({ name, help: name });
      } else {
        this.histograms[name] = new Histogram({
          name,
          help: name,
          buckets: [0.1, 0.5, 1, 5],
        });
      }
    }
  }

  recordCleanupJob(count: number, durationMs: number): void {
    this.counters['session_cleanups_total'].inc(count);
    this.histograms['session_cleanup_duration_seconds'].observe(
      durationMs / 1000,
    );
  }
}
