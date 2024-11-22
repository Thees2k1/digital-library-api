export abstract class AuthRepository {
  abstract saveSession(session: Object): Promise<string | number |boolean>;
  abstract deleteSession(sessionIdentity: string): Promise<string>;
}
