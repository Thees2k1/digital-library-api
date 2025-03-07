import { Server } from './server';
import { config } from '@core/config/config';
import { initializeInfrastucture } from './core/di/container';
import { AppRouter } from './core/router/routes';

(() => {
  runApp();
})();

function runApp() {
  initializeInfrastucture();
  const server = new Server({
    port: config.port,
    routes: AppRouter.routes,
    apiPrefix: config.apiPrefix,
  });
  server.start();
}
