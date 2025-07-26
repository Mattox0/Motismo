import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

// Cette fonction sera exécutée avant withAuth
function middleware() {
  return NextResponse.next();
}

// On exporte le middleware avec withAuth
export default withAuth(middleware, {
  callbacks: {
    authorized: ({ token, req }) => {
      const isPublicPath =
        req.nextUrl.pathname.startsWith('/auth') ||
        req.nextUrl.pathname === '/' ||
        req.nextUrl.pathname.startsWith('/game');

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
