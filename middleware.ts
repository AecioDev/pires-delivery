import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Proteção das rotas admin ──
  const adminCookie = request.cookies.get('admin_token');
  const isAdminRoute = [
    '/dashboard', '/kitchen', '/settings', '/insumos',
    '/produtos', '/receitas', '/clientes', '/pdv', '/financeiro'
  ].some((p) => pathname.startsWith(p));

  if (isAdminRoute) {
    if (!adminCookie || adminCookie.value !== 'authenticated') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── Tela de boas-vindas (loja) ──
  // Só redireciona para /bem-vindo se o cliente acessar a raiz /
  // e ainda não viu a tela (sem cookie cpd_welcomed)
  const welcomed = request.cookies.get('cpd_welcomed');
  const isShopRoot = pathname === '/';

  if (isShopRoot && !welcomed) {
    const url = request.nextUrl.clone();
    url.pathname = '/bem-vindo';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/kitchen/:path*',
    '/settings/:path*',
    '/insumos/:path*',
    '/produtos/:path*',
    '/receitas/:path*',
    '/clientes/:path*',
    '/pdv/:path*',
    '/financeiro/:path*',
  ],
};
