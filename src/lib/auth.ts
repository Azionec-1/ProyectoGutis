import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-secret-change-me";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  uid: string;
  role: UserRole;
  workerId?: string | null;
  iat: number;
  exp: number;
};

export const sessionCookieName = "session";
export const sessionCookieMaxAgeSeconds = COOKIE_MAX_AGE_SECONDS;

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: { userId: string; role: UserRole; workerId?: string | null }) {
  return jwt.sign(
    {
      uid: payload.userId,
      role: payload.role,
      workerId: payload.workerId ?? null
    },
    JWT_SECRET,
    { expiresIn: COOKIE_MAX_AGE_SECONDS }
  );
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}
