import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminCookie = request.cookies.get('admin_token');
  const url = request.nextUrl.clone();

  // If there's no admin_token cookie, redirect to /login
  if (!adminCookie || adminCookie.value !== 'authenticated') {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Config to only run middleware on specific protected admin paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/kitchen/:path*',
    '/settings/:path*',
    '/insumos/:path*',
    '/produtos/:path*',
    '/receitas/:path*',
    '/clientes/:path*',
    '/pdv/:path*',
    '/financeiro/:path*'
  ]
};
