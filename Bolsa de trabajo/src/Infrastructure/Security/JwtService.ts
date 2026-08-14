import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: number;
  username: string;
  roles: string[];
}

export class JwtService {
  private static get secret(): string {
    return process.env.JWT_SECRET || 'super_secret_key_default_bolsa_trabajo';
  }

  private static get expiresIn(): string {
    return process.env.JWT_EXPIRES_IN || '24h';
  }

  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as any });
  }

  static verifyToken(token: string): TokenPayload {
    return jwt.verify(token, this.secret) as TokenPayload;
  }
}
