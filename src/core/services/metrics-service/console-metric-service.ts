import { MetricsService } from '@src/core/interfaces/mertric-service';
import { injectable } from 'inversify';

@injectable()
export class ConsoleMetricsService implements MetricsService {
  recordCleanupJob(sessionsCleaned: number, durationMs: number): void {
    console.log(
      `[Metrics] Cleaned ${sessionsCleaned} sessions in ${durationMs}ms`,
    );
  }

  recordCleanupFailure(): void {
    console.error('[Metrics] Cleanup job failed');
  }

  incrementCounter(metricName: string): void {
    console.log(`[Metrics] Incremented ${metricName}`);
  }
}
