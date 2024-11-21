import { config } from "@src/core/config/config";
import jwt from "jsonwebtoken";

export interface JwtServiceMetaData {
  audience: string;
  issuer: string;
}
export class JwtService<P extends string | Buffer | object> {
  private readonly jwtSecret = {
    accessToken: config.accessTokenSecret,
    refreshToken: config.refreshTokenSecret,
  };

  private readonly metaData: JwtServiceMetaData;
  constructor(metaData: JwtServiceMetaData) {
    this.metaData = metaData;
  }
  generate(payload: P, expiresIn: string) {
    const access = jwt.sign(payload, this.jwtSecret.accessToken, {
      expiresIn: expiresIn,
      audience: this.metaData.audience,
      issuer: this.metaData.issuer,
    });
    const refresh = jwt.sign(payload, this.jwtSecret.refreshToken, {
      expiresIn: expiresIn,
      audience: this.metaData.audience,
      issuer: this.metaData.issuer,
    });
    return { accessToken: access, refreshToken: refresh };
  }
}
