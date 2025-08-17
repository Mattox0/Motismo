import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

function middleware() {
  return NextResponse.next();
}

export default withAuth(middleware, {
  callbacks: {
    authorized: ({ token, req }) => {
      const isPublicPath =
        req.nextUrl.pathname.startsWith('/auth') ||
        req.nextUrl.pathname === '/' ||
        req.nextUrl.pathname.startsWith('/game') ||
        req.nextUrl.pathname === '/contact';

      if (isPublicPath) {
        return true;
      }

      return !!token;
    },
  },
  pages: {
    signIn: '/auth',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/quiz/:path*',
    '/((?!auth|api|_next/static|_next/image|favicon.ico).*)',
  ],
};
