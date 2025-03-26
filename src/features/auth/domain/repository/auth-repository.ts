import { SessionDTO } from '../../application/dtos/session-dto';
import { AuthSession } from '../entities/auth';

export abstract class AuthRepository {
  abstract saveSession(session: SessionDTO): Promise<AuthSession>;
  abstract deleteSession(sessionIdentity: string): Promise<string>;
  abstract findSessionByIdentity(
    sessionIdentity: string,
  ): Promise<AuthSession | null>;
  abstract findSessionsByUserId(userId: string): Promise<AuthSession[]>;
  abstract findSessionByUserDevice(
    userId: string,
    userAgent: string,
    device: string,
  ): Promise<AuthSession | null>;
  abstract countUserSessions(userId: string): Promise<number>;
  abstract enforceSessionLimit(userId: string, limit: number): Promise<void>;
  abstract cleanupExpiredSessions(): Promise<void>;
  abstract revokeAllSessions(userId: string): Promise<void>;
  abstract revokeSession(sessionIdentity: string): Promise<void>;
  abstract revokeSessions(sessionIdentities: string[]): Promise<void>;
}
