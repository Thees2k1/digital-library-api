import compression from "compression";
import cors, { CorsOptions } from "cors";
import express, {
  Application,
  NextFunction,
  type Request,
  type Response,
  type Router,
} from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes";
import { ONE_HUNDRED, ONE_THOUSAND, SIXTY } from "./core/constants/constants";
import { AppError } from "./core/errors/custom-error";
import { ErrorMiddleware } from "./features/shared/application/middlewares/error-middleware";
import "./features/shared/infrastructure/utils/logger/global-logger";

import { PrismaClient } from "@prisma/client";
//Inversify
import "reflect-metadata";
import { container } from "./features/shared/infrastructure/utils/inversify-config";
import { INTERFACE_TYPE } from "@src/core/constants/constants";
import { AuthInteractor } from "@src/features/auth/application/interactor/auth-interactor";
import { AuthUseCase } from "@src/features/auth/domain/use-cases/auth-use-case";
import { AuthController } from "@src/features/auth/presentation/controller/auth-controller";
import { UserInteractor } from "@src/features/user/application/interactor/user-interactor";
import { UserRepository } from "@src/features/user/domain/repository/user-repository";
import { UserUseCase } from "@src/features/user/domain/use-cases/user-use-case";
import { PersistenceUserRepository } from "@src/features/user/infrastructure/repository/persitence-user-repository";
import { UserController } from "@src/features/user/presentation/controller/user-controller";
import { AuthRepository } from "./features/auth/domain/repository/auth-repository";
import { JwtAuthRepository } from "./features/auth/infrastructure/repository/auth-repository-impl";

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

    // this.initializeInfrastucture();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeInfrastucture(): void {
    //binding services
    container
      .bind<PrismaClient>(INTERFACE_TYPE.PrismaClient)
      .toConstantValue(new PrismaClient());

    //binding repositories
    container
      .bind<UserRepository>(INTERFACE_TYPE.UserRepository)
      .to(PersistenceUserRepository);
    container.bind<AuthRepository>(INTERFACE_TYPE.AuthRepository).to(JwtAuthRepository);

    //binding use cases
    container
      .bind<UserUseCase>(INTERFACE_TYPE.UserInteractor)
      .to(UserInteractor);
    container.bind<AuthUseCase>(INTERFACE_TYPE.AuthUseCase).to(AuthInteractor);

    //binding controllers
    container
      .bind<UserController>(INTERFACE_TYPE.UserController)
      .to(UserController);
    container
      .bind<AuthController>(INTERFACE_TYPE.AuthController)
      .to(AuthController);
  }

  private initializeMiddlewares(): void {
    var whitelist = ["http://localhost:3000", "http://localhost:8080"];
    var corsOptions: CorsOptions = {
      origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
    };

    this.app.use(helmet());
    this.app.use(cors(corsOptions));
    this.app.use(
      rateLimit({
        max: ONE_HUNDRED,
        windowMs: SIXTY * SIXTY * ONE_THOUSAND,
        message: "Too many requests from this IP, please try again in one hour",
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(compression());
  }

  private initializeRoutes(): void {
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
    this.app.use(this.apiPrefix, this.routes);
  }

  private initializeErrorHandling(): void {
    this.routes.use(ErrorMiddleware.handleError);
  }
  async start(): Promise<void> {
    this.app.listen(this.port, () => {
      console.info(`Server running on port ${this.port}`);
    });
  }
}
