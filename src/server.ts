import compression from "compression";
import express, {
  Application,
  NextFunction,
  type Request,
  type Response,
  type Router,
} from "express";
import rateLimit from "express-rate-limit";
import { StatusCodes } from "http-status-codes";
import { ONE_HUNDRED, ONE_THOUSAND, SIXTY } from "./core/constants/constants";
import { AppError } from "./core/errors/custom-error";
import { ErrorMiddleware } from "./features/shared/application/middlewares/error-middleware";
import helmet from "helmet";
import cors, { CorsOptions } from "cors";
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

  async start(): Promise<void> {
    var whitelist = ["http://localhost:3000","http://localhost:8080"];
    var corsOptions: CorsOptions = {
      origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
    };

    console.log("Starting server...");
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(compression());
    this.app.use(
      rateLimit({
        max: ONE_HUNDRED,
        windowMs: SIXTY * SIXTY * ONE_THOUSAND,
        message: "Too many requests from this IP, please try again in one hour",
      })
    );
    this.app.use(helmet());
    this.app.use(cors(corsOptions));

    this.app.use(this.apiPrefix, this.routes);

    this.app.get("/", (_req: Request, res: Response) => {
      res.status(StatusCodes.OK).send({
        message: `Welcome to Chyra API! \n Endpoints available at http://localhost:${this.port}/`,
      });
    });

    this.app.get("/health", (req: Request, res: Response) => {
      res.json({ status: "ok" });
    });

    this.routes.all(
      "*",
      (req: Request, _: Response, next: NextFunction): void => {
        next(AppError.notFound(`Cant find ${req.originalUrl} on this server!`));
      }
    );

    // Handle errors middleware
    this.routes.use(ErrorMiddleware.handleError);

    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}
