import { TokenData } from "@src/features/shared/domain/interfaces/token-data";
import { SessionDTO } from "@src/features/user/domain/dtos/session-dto";

export abstract class AuthRepository{
    abstract createToken(payload: TokenData, expiresIn:string): Promise<string>; 
    abstract saveSession(session : SessionDTO): Promise<string>;
    abstract deleteSession(refreshToken: string): Promise<boolean>;
}

