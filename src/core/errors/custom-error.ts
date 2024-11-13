import { StatusCodes } from "http-status-codes";

interface AppErrorArgs {
  name?: string;
  statusCode: StatusCodes;
  message: string;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly name: string;
  public readonly statusCode: StatusCodes;
  public readonly isOperational: boolean = true;
  constructor(args: AppErrorArgs) {
    const { name = "Error", statusCode, message, isOperational } = args;
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    if (isOperational !== undefined) this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
  static badRequest(message: string): AppError {
    return new AppError({ message, statusCode: StatusCodes.BAD_REQUEST });
  }

  static unauthorized(message: string): AppError {
    return new AppError({ message, statusCode: StatusCodes.UNAUTHORIZED });
  }

  static forbidden(message: string): AppError {
    return new AppError({ message, statusCode: StatusCodes.FORBIDDEN });
  }

  static notFound(message: string): AppError {
    return new AppError({ message, statusCode: StatusCodes.NOT_FOUND });
  }

  static internalServer(message: string): AppError {
    return new AppError({
      message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}
