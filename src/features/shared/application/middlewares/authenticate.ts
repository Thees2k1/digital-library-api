import { config } from "@src/core/config/config";
import {type NextFunction ,type Request, type Response} from "express";
import jwt from "jsonwebtoken";
import { TokenData } from "../../domain/interfaces/token-data";


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {


    try {
        const token = req.headers.authorization!.split(' ')[1];
        if(!token){
            return res.status(401).json({message:"Unauthorized"});
        }
        const verificationRes =await jwt.verify(token, config.accessTokenSecret) as TokenData;
        if(!verificationRes){
            return res.status(401).json({message:"Unauthorized"});
        }
        req.body = verificationRes;
        next();
    } catch (error) {
        next(error);
    }
};