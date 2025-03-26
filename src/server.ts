import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors, { CorsOptions } from 'cors';
import express, {
  Application,
  NextFunction,
  type Request,
  type Response,
  type Router,
} from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
import { ONE_THOUSAND, SIXTY } from './core/constants/constants';
import { AppError } from './core/errors/custom-error';
import { ErrorMiddleware } from './core/middlewares/error-middleware';
import 'reflect-metadata';
import { container } from './core/di/container';
import logger from './core/utils/logger/logger';
import { IndexingService } from './features/book/infrastructure/index-service';
import { DI_TYPES } from './core/di/types';
import { SessionCleanupService } from './core/services/session-cleanup-service';

interface ServerOptions {
  port: number;
  routes: Router;
  apiPrefix: string;
}

export class Server {
  private readonly app: Application = express();
  private readonly port: number;
  private readonly routes: Router;
  private readonly apiPrefix: string;

  constructor(options: ServerOptions) {
    const { port, routes, apiPrefix } = options;
    this.port = port;
    this.routes = routes;
    this.apiPrefix = apiPrefix;
    this.init();
  }

  async start(): Promise<void> {
    this.app.listen(this.port, '0.0.0.0', () => {
      logger.info(`Server running on port ${this.port}`);
    });
  }

  private init(): void {
    logger.info('Initializing server...');
    try {
      this.initializeServices();
      this.initializeMiddlewares();
      this.initializeRoutes();
      this.initializeErrorHandling();
    } catch (error) {
      logger.error('Error initializing server', error);
    }
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors(this.configurateCors()));
    // this.app.options('*', cors(corsOptions));
    this.app.use(
      rateLimit({
        max: 500, // Allow 500 requests
        windowMs: SIXTY * SIXTY * ONE_THOUSAND, // 1 hour
        message: 'Too many requests from this IP, please try again in one hour',
      }),
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(compression());
    this.app.set('trust proxy', 1);
  }

  private initializeRoutes(): void {
    this.app.get('/', (_req: Request, res: Response) => {
      res.status(StatusCodes.OK).send({
        message: `Welcome to Chyra API! \n Endpoints available at http://localhost:${this.port}/`,
      });
    });

    this.app.get('/health', (req: Request, res: Response) => {
      const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
      };
      try {
        res.send(healthcheck);
      } catch (error) {
        healthcheck.message = `${error}`;
        res.status(StatusCodes.SERVICE_UNAVAILABLE).send();
      }
    });

    this.routes.all(
      '*',
      (req: Request, _: Response, next: NextFunction): void => {
        next(AppError.notFound(`Cant find ${req.originalUrl} on this server!`));
      },
    );
    this.app.use(this.apiPrefix, this.routes);
  }

  private initializeErrorHandling(): void {
    this.routes.use(ErrorMiddleware.handleError);
  }

  private initializeServices(): void {
    // Initialize services here
    const indexingService = container.get<IndexingService>(IndexingService);
    indexingService.reindexAllBooks();
    const sessionCleanupService = container.get<SessionCleanupService>(
      DI_TYPES.SessionCleanupService,
    );
    sessionCleanupService.start();
  }

  private configurateCors(): CorsOptions {
    const whitelist = [
      'http://localhost:3000',
      'http://localhost:80',
      'http://localhost',
      'http://13.212.138.64',
      'http://localhost:5173',
      'http://localhost:4173',
      'https://chyra.vercel.app',
      'https://chyra.me',
      'https://lib.chyra.me',
      'https://admin.chyra.me',
      'https://www.chyra.me',
      'https://api.chyra.me',
    ];
    return {
      origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
          callback(null, true); // Allow the request
        } else {
          callback(new Error('Not allowed by CORS')); // Block the request
        }
      },
      credentials: true,
    } as CorsOptions;
  }
}
