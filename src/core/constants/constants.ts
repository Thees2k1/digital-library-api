export const VERSION_PREFIX = "/v1";

export const ONE_THOUSAND = 1000;
export const ONE_HUNDRED = 100;
export const SIXTY = 60;


export const INTERFACE_TYPE ={
    UserRepository: Symbol.for("UserRepository"),
    UserInteractor: Symbol.for("UserInteractor"),
    UserController: Symbol.for("UserController"),
    Mailer: Symbol.for("Mailer"),
    MessageBroker: Symbol.for("MessageBroker"),
    AuthUseCase: Symbol.for("AuthUseCase"),
    AuthController: Symbol.for("AuthController"),
    PrismaClient: Symbol.for("PrismaClient"),
    AuthRepository: Symbol.for("AuthRepository"),
    Logger: Symbol.for("Logger"),
}

export const REFRESH_TOKEN = "refresh_token";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000;

export const INVALID_CREDENTIALS = "Invalid credentials";

export const LOGOUT_SUCCESS = "Logout success";

export const DEFAULT_TOKEN_ISSUER = "Chyra-API";

//MESSAGES

export const SUCCESSFUL = "Successful";
export const FAILED = "Failed";

