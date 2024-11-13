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

    //CORS
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      // Add your origins
      const allowedOrigins = ["http://localhost:3000"];
      const origin = req.headers.origin;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (allowedOrigins.includes(origin!)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        res.setHeader("Access-Control-Allow-Origin", origin!);
      }
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      next();
    });

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
      console.log(`Server running on http://localhost:${this.port}`);
    });
  }
}
