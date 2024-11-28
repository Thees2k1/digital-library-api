import { config } from '@src/core/config/config';
import { DEFAULT_TOKEN_ISSUER } from '@src/core/constants/constants';
import jwt, { JwtPayload } from 'jsonwebtoken';

export class JwtService {
  private readonly jwtMetadata = {
    issuer: DEFAULT_TOKEN_ISSUER,
    accessToken: config.accessTokenSecret,
    refreshToken: config.refreshTokenSecret,
  };

  generate(payload: string | JwtPayload, options: jwt.SignOptions) {
    return jwt.sign(payload, this.jwtMetadata.accessToken, {
      ...options,
      issuer: this.jwtMetadata.issuer,
    });
  }

  verify(token: string) {
    try {
      return {
        success: true,
        data: jwt.verify(token, this.jwtMetadata.accessToken),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Invalid token',
      };
    }
  }
}
