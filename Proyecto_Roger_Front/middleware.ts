import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/login', '/registro', '/unauthorized'];

const roleByPrefix: Record<string, string> = {
  '/aspirante': 'aspirante',
  '/empresa': 'empresa',
  '/vinculacion': 'vinculacion',
};

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
    return NextResponse.redirect(new URL(`/${userRole ?? 'aspirante'}`, request.url));
  }

  const matchedPrefix = Object.keys(roleByPrefix).find((prefix) => pathname.startsWith(prefix));

  if (matchedPrefix && roleByPrefix[matchedPrefix] !== userRole) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
