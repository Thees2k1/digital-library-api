import { config } from "@src/core/config/config";
import {type NextFunction ,type Request, type Response} from "express";
import jwt from "jsonwebtoken";
import { AppError } from "@src/core/errors/custom-error";
import logger from "../../infrastructure/utils/logger/logger";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.split(' ')[1];
        if(!token){
            next(AppError.unauthorized("Unauthorized"));
            return;
        }
        try {
            const decoded = jwt.verify(token, config.accessTokenSecret);
            req.body = decoded;
            next();
        } catch (error) {
            logger.error("Error verifying token: ", error);
            next(AppError.unauthorized("Unauthorized"));
        }
};