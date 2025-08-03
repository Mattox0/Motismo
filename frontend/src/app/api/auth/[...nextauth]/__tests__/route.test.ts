// src/app/api/auth/[...nextauth]/__tests__/route.test.ts

// 1) Mock providers so imports in route.ts don't blow up
jest.mock('next-auth/providers/google', () => ({
  __esModule: true,
  default: jest.fn(() => ({ id: 'google' })),
}));
jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: jest.fn(() => ({ id: 'credentials' })),
}));

// 2) Mock next-auth to return a concrete handler function
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn(() => Promise.resolve({}))),
}));

// 3) Polyfill fetch if your code calls it
global.fetch = jest.fn();

import { GET, POST } from '../route';

describe('NextAuth API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure required env vars are set
    process.env.GOOGLE_CLIENT_ID     = 'test-google-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
    process.env.NEXT_PUBLIC_API_URL  = 'http://localhost:3001';
  });

  it('exports GET and POST handlers as functions', () => {
    expect(GET).toBeDefined();
    expect(typeof GET).toBe('function');
    expect(POST).toBeDefined();
    expect(typeof POST).toBe('function');
    expect(GET).toBe(POST);
  });
});
