import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { adminAuth } from './firebase-admin.ts';

const EPHEMERAL_SECRET = crypto.randomBytes(32).toString('hex');

function getSigningSecret(): string {
  return process.env.SESSION_SECRET?.trim() || EPHEMERAL_SECRET;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const keyBuf = Buffer.from(keyHex, 'hex');
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

export function generateSixDigitOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function hashOtp(email: string, otp: string): string {
  return crypto
    .createHmac('sha256', getSigningSecret())
    .update(`${email.trim().toLowerCase()}:${otp.trim()}`)
    .digest('hex');
}

export function verifyOtpHash(email: string, otp: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashOtp(email, otp), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

export interface EvoraSessionPayload {
  uid: string;
  email: string;
  role: string;
  exp: number;
}

export function signSessionToken(payload: Omit<EvoraSessionPayload, 'exp'>): string {
  const fullPayload: EvoraSessionPayload = {
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string): EvoraSessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(encoded)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as EvoraSessionPayload;
    if (!parsed.uid || !parsed.email || parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  authUser?: {
    uid: string;
    email: string;
    name?: string;
    role?: string;
  };
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Token autentikasi diperlukan.' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  // 1. Try EVORA signed session token (Email + OTP users)
  const localSession = verifySessionToken(token);
  if (localSession) {
    req.authUser = {
      uid: localSession.uid,
      email: localSession.email,
      role: localSession.role,
    };
    next();
    return;
  }

  // 2. Try Firebase ID Token (Google OAuth Sign-In users)
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.email) {
      res.status(401).json({ error: 'Unauthorized: Email akun Google tidak tersedia.' });
      return;
    }
    req.authUser = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: Sesi tidak valid atau telah berakhir.' });
  }
};
