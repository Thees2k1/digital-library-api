import cron from 'node-cron';
import { container } from '@src/core/di/container';
import { PopularityService } from '../../application/services/popularity-service';
import logger from '@src/core/utils/logger/logger';
import { DI_TYPES } from '@src/core/di/types';

export function initializePopularityCron() {
  const popularityService = container.get<PopularityService>(
    DI_TYPES.PopularityService,
  );

  cron.schedule('0 0 * * *', async () => {
    logger.info('Running popularity calculation...');
    try {
      await popularityService.calculateAuthorPopularity();
      await popularityService.calculateCategoryPopularity();
      logger.info('Popularity calculation completed.');
    } catch (error) {
      logger.error('Error occurred during popularity calculation:', error);
    }
  });
}
