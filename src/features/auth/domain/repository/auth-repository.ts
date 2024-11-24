export abstract class AuthRepository {
  abstract saveSession(session: Object): Promise<string | number |boolean>;
  abstract deleteSession(sessionIdentity: string): Promise<string>;
  abstract findSessionByIdentity(sessionIdentity: string): Promise<string|string>;
  abstract findSessionByUserId(userId: string): Promise<object|string>;
  abstract verifySession(sessionIdentity: string): Promise<"valid"|"invalid">;
}
