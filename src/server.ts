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
import { ONE_HUNDRED, ONE_THOUSAND, SIXTY } from './core/constants/constants';
import { AppError } from './core/errors/custom-error';
import { ErrorMiddleware } from './core/middlewares/error-middleware';

// import "./features/shared/infrastructure/utils/logger/global-logger";
import 'reflect-metadata';

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
  }

  private initializeMiddlewares(): void {
    const whitelist = [
      'http://localhost:3000',
      'http://localhost:80',
      'http://localhost',
      'http://localhost:5173',
      'http://localhost:4173',
      'https://chyra.vercel.app',
    ];
    const corsOptions: cors.CorsOptions = {
      origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
          callback(null, true); // Allow the request
        } else {
          callback(new Error('Not allowed by CORS')); // Block the request
        }
      },
      credentials: true,
    };

    this.app.use(helmet());
    this.app.use(cors(corsOptions));
    this.app.options('*', cors(corsOptions));
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
      res.json({ status: 'ok' });
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
  async start(): Promise<void> {
    this.init();
    this.app.listen(this.port, () => {
      console.info(`Server running on port ${this.port}`);
    });
  }

  private init(): void {
    console.log('Initializing server...');
    console.log('NODE_ENV', process.env.NODE_ENV);
    try {
      this.initializeMiddlewares();
      this.initializeRoutes();
      this.initializeErrorHandling();
    } catch (error) {
      console.error('Error initializing server', error);
    }
  }
}
