import { config } from "@src/core/config/config";
import jwt from "jsonwebtoken";

export interface JwtServiceMetaData {
  audience: string;
  issuer: string;
}
export class JwtService {
  private readonly jwtSecret = {
    accessToken: config.accessTokenSecret,
    refreshToken: config.refreshTokenSecret,
  };


  private readonly metaData: JwtServiceMetaData;
  constructor(metaData: JwtServiceMetaData) {
    this.metaData = metaData;
  }

  generate(payload: string | Buffer | object, expiresIn: string) {
    return jwt.sign(payload, this.jwtSecret.accessToken, {
      expiresIn: expiresIn,
      audience: this.metaData.audience,
      issuer: this.metaData.issuer,
    });
  }
  generateTokensPair(payload: string | Buffer | object, expiresIn: string) {
    const access = jwt.sign(payload, this.jwtSecret.accessToken, {
      expiresIn: expiresIn,
      audience: this.metaData.audience,
      issuer: this.metaData.issuer,
    });
    const refresh = jwt.sign(payload, this.jwtSecret.accessToken, {
      expiresIn: expiresIn,
      audience: this.metaData.audience,
      issuer: this.metaData.issuer,
    });
    return { accessToken: access, refreshToken: refresh };
  }

  verify(token: string) {
    try {
      return { success: true, data: jwt.verify(token, this.jwtSecret.accessToken) };
    } catch (error:any) {
      return { 
        success: false,
        error: error.message || 'Invalid token'
      };
    }
  }
}
