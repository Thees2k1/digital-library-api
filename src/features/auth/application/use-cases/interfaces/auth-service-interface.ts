import { LoginBodyDTO, LoginResultDTO } from '../../dtos/login-dto';
import { LogoutParamsDTO } from '../../dtos/logout-dto';
import {
  RefreshResultDTO,
  RefreshTokenParamsDTO,
} from '../../dtos/refresh-token';
import { RegisterBodyDTO, RegisterResultDTO } from '../../dtos/register-dto';

export interface IAuthService {
  login(credential: LoginBodyDTO): Promise<LoginResultDTO>;
  register(data: RegisterBodyDTO): Promise<RegisterResultDTO>;
  logout(params: LogoutParamsDTO): Promise<string>;
  refreshTokens(params: RefreshTokenParamsDTO): Promise<RefreshResultDTO>;
}
