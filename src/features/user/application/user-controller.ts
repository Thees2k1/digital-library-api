import {type NextFunction,type Request,type  Response } from "express";
import {type UserRepository } from "../domain/repository/user-repository";
import { type UserEntity } from "../domain/entities/user";
import { GetAllUsers } from "../domain/use-cases/get-all-users";

export class UserController {
    constructor(private readonly userRepository: UserRepository) {    }
    async getAllUsers(req: Request, res: Response<UserEntity[] | any>, next: NextFunction) {
        new GetAllUsers(this.userRepository).execute().then((users) => {
            res.status(200).json(users);
        }).catch((error) => {
            next(error);
        });
    }
}