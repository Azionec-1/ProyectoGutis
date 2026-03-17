import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-secret-change-me";
const COOKIE_NAME = "session";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/assets",
  "/images"
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function toBase64(base64url: string) {
  const normalized = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;

  if (padding === 0) {
    return normalized;
  }

  return normalized.padEnd(normalized.length + (4 - padding), "=");
}

function decodeBase64(base64: string) {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

async function verifyHs256Token(token: string) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [header, payload, signature] = parts;
  const data = new TextEncoder().encode(`${header}.${payload}`);
  const signatureBytes = decodeBase64(toBase64(signature));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["verify"]
  );

  const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, data);

  if (!isValid) {
    return false;
  }

  const payloadBytes = decodeBase64(toBase64(payload));
  const payloadJson = JSON.parse(new TextDecoder().decode(payloadBytes)) as {
    exp?: number;
  };

  if (!payloadJson.exp) {
    return false;
  }

  return payloadJson.exp * 1000 > Date.now();
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  const isValid = await verifyHs256Token(token);

  if (isValid) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/(.*)"]
};
