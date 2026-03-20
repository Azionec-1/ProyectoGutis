import "server-only";

import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";
import { prisma } from "./prisma";
import { sessionCookieMaxAgeSeconds, sessionCookieName, signSession, verifySession } from "./auth";

export async function setSessionCookie(user: { id: string; role: UserRole; workerId?: string | null }) {
  const token = signSession({ userId: user.id, role: user.role, workerId: user.workerId });
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionCookieMaxAgeSeconds
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (!token) return null;

  const payload = verifySession(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      workerId: true,
      isApproved: true,
      worker: {
        select: {
          id: true,
          fullName: true,
          isActive: true
        }
      }
    }
  });

  if (!user) {
    return null;
  }

  if (user.role === "WORKER" && (!user.workerId || !user.worker?.isActive || !user.isApproved)) {
    return null;
  }

  return user;
}
