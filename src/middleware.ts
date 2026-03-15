import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
const COOKIE_NAME = 'session';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// Rutas públicas que NO requieren autenticación
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/api/auth', // incluye /api/auth/*
  '/_next', // assets de Next
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/assets',
  '/images',
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Dejar pasar recursos públicos y rutas de auth
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, SECRET_KEY);
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
}

// Proteger TODAS las rutas, excepto las públicas controladas arriba
export const config = {
  matcher: ['/(.*)'],
};
