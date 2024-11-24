export interface SessionDTO{
    sessionIdentity: string;
    userId: string;
    expiration: number;
    ipAddress?: string;
    userAgent?: string;
}