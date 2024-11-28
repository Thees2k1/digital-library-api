import { LoginBodyDTO, LoginResultDTO } from '../dtos/login-dto';
import { RefreshResultDTO } from '../dtos/refresh-token';
import { RegisterBodyDTO, RegisterResultDTO } from '../dtos/register-dto';

export interface AuthUseCase {
  login(credential: LoginBodyDTO): Promise<LoginResultDTO>;
  register(data: RegisterBodyDTO): Promise<RegisterResultDTO>;
  logout(refreshToken: string): Promise<string>;
  refreshTokens(refreshToken: string): Promise<RefreshResultDTO>;
}
