import {Server} from './server';
import {config} from '@core/config/config';
import {AppRoutes} from './routes';

(()=>{
  main();
})();

function main(){
  const server = new Server({
    port: config.port,
    routes: AppRoutes.routes,
    apiPrefix: config.apiPrefix
  });
  void server.start();
}
