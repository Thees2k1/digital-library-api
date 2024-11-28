export const DI_TYPES = {
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
  };