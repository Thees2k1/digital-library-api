import { type NextFunction, type Request, type Response } from "express";
import { UserInteractor } from "../../application/interactor/user-interactor";
import { type UserEntity } from "../../domain/entities/user";
import { inject, injectable } from "inversify";
import { INTERFACE_TYPE } from "@src/core/constants/constants";

@injectable()
export class UserController {
    private readonly interactor: UserInteractor;
    constructor(@inject(INTERFACE_TYPE.UserInteractor ) interactor: UserInteractor) {
        this.interactor = interactor;
        }
    async getAllUsers(req: Request, res: Response<UserEntity[] | any>, next: NextFunction) { 
        try{
            const users = await this.interactor.getUsers();
            res.status(200).json(users);
        }catch(error){
            next(error);
        }
    }
}