jest.mock('next-auth/middleware', () => {
  const withAuth = jest.fn((handler, options) => {
    ;(handler as any).authOptions = options;
    return handler;
  });
  return {
    __esModule: true,
    withAuth,
  };
});

jest.mock('next/server', () => ({
  __esModule: true,
  NextResponse: {
    next: jest.fn(() => ({ ok: true })),
  },
}));

import { NextResponse } from 'next/server';
import middleware, { config } from '../middleware';
import { withAuth } from 'next-auth/middleware';

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handler calls NextResponse.next()', () => {
    const req = { nextUrl: { pathname: '/any' } } as any;
    const result = middleware(req, {} as any);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });

  describe('authorized callback', () => {
    const options = (middleware as any).authOptions;
    const authorized: (
      args: { token: unknown; req: { nextUrl: { pathname: string } } }
    ) => boolean = options.callbacks.authorized;

    it('allows public paths without token', () => {
      const publicPaths = ['/auth/login', '/', '/game/abc', '/game'];
      publicPaths.forEach(path => {
        expect(
          authorized({ token: null, req: { nextUrl: { pathname: path } } })
        ).toBe(true);
      });
    });

    it('denies protected paths when token is missing', () => {
      expect(
        authorized({ token: null, req: { nextUrl: { pathname: '/dashboard' } } })
      ).toBe(false);
    });

    it('allows protected paths when token is present', () => {
      expect(
        authorized({ token: { foo: 'bar' }, req: { nextUrl: { pathname: '/dashboard/settings' } } })
      ).toBe(true);
    });
  });

  it('exports correct pages.signIn and matcher config', () => {
    const options = (middleware as any).authOptions;
    expect(options.pages.signIn).toBe('/auth');
    expect(config.matcher).toEqual([
      '/dashboard/:path*',
      '/quiz/:path*',
      '/((?!auth|api|_next/static|_next/image|favicon.ico).*)',
    ]);
  });
});
