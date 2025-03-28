export interface MetricsService {
  recordCleanupJob(sessionsCleaned: number, durationMs: number): void;
  recordCleanupFailure(): void;
  incrementCounter(metricName: string, tags?: Record<string, string>): void;
}
