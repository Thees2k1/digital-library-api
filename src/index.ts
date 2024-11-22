import {Server} from './server';
import {config} from '@core/config/config';
import {AppRoutes} from './routes';
import {initializeInfrastucture } from './features/shared/infrastructure/utils/inversify-config';

(()=>{
  main();
})();

function main(){
  initializeInfrastucture();
  const server = new Server({
    port: config.port,
    routes: AppRoutes.routes,
    apiPrefix: config.apiPrefix
  });
  server.start();
}
