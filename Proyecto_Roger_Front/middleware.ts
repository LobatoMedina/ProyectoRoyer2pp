import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/login', '/registro', '/unauthorized'];

/** Roles autorizados para cada sección del portal. */
const rolesByPrefix: Record<string, string[]> = {
  '/aspirante': ['aspirante'],
  '/empresa': ['empresa'],
  '/vinculacion': ['vinculacion', 'control-escolar'],
};

/**
 * Secciones del panel de vinculación reservadas a la Coordinación.
 * Control Escolar solo consulta expedientes y reportes.
 */
const vinculacionOnlyRoutes = [
  '/vinculacion/usuarios',
  '/vinculacion/convenios',
  '/vinculacion/empresas',
  '/vinculacion/vacantes',
  '/vinculacion/postulaciones',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!token) {
    return isPublicRoute ? NextResponse.next() : NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/login' || pathname.startsWith('/registro')) {
    const home = userRole === 'control-escolar' ? '/vinculacion/aspirantes' : `/${userRole ?? 'aspirante'}`;
    return NextResponse.redirect(new URL(home, request.url));
  }

  const matchedPrefix = Object.keys(rolesByPrefix).find((prefix) => pathname.startsWith(prefix));

  if (matchedPrefix && !rolesByPrefix[matchedPrefix]!.includes(userRole ?? '')) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (
    userRole === 'control-escolar' &&
    vinculacionOnlyRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  ) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
