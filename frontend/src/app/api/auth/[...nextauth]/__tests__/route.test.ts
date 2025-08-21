import type { NextAuthOptions } from 'next-auth';

let capturedConfig: NextAuthOptions | null = null;
const handlerMock = jest.fn();

jest.mock('next-auth', () => ({
  __esModule: true,
  default: (config: NextAuthOptions) => {
    capturedConfig = config;
    return handlerMock;
  },
}));

jest.mock('next-auth/providers/google', () => ({
  __esModule: true,
  default: (cfg: any) => ({ id: 'google', ...cfg }),
}));

jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: (cfg: any) => ({
    id: 'credentials',
    name: cfg?.name ?? 'credentials',
    credentials: cfg?.credentials,
    authorize: cfg?.authorize,
  }),
}));

const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV };
  process.env.GOOGLE_CLIENT_ID = 'gid';
  process.env.GOOGLE_CLIENT_SECRET = 'gsecret';
  process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
  capturedConfig = null;
  handlerMock.mockReset();
  (global as any).fetch = undefined;
});

afterAll(() => {
  process.env = OLD_ENV;
});

const importRoute = async () => {
  const mod = await import('../route');
  return mod as {
    GET: any;
    POST: any;
  };
};

describe('NextAuth route config', () => {
  it('exports GET and POST handlers and initializes NextAuth with providers', async () => {
    const { GET, POST } = await importRoute();

    expect(typeof GET).toBe('function');
    expect(POST).toBe(GET);

    expect(capturedConfig).toBeTruthy();
    const providers = capturedConfig!.providers as any[];

    expect(providers.some(p => p.id === 'google')).toBe(true);
    expect(providers.some(p => p.id === 'credentials')).toBe(true);

    expect(capturedConfig!.pages?.signIn).toBe('/auth');
    expect(capturedConfig!.session?.strategy).toBe('jwt');
    expect(capturedConfig!.session?.maxAge).toBe(30 * 24 * 60 * 60);
    expect(capturedConfig!.debug).toBe(false);
  });
});

describe('Credentials authorize()', () => {
  const getCredsProvider = () => {
    const providers = capturedConfig!.providers as any[];
    return providers.find(p => p.id === 'credentials');
  };

  it('returns null when API ok but no accessToken', async () => {
    await importRoute();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'u1', username: 'john' }),
    } as any);

    const user = await getCredsProvider().authorize({
      email: 'john@example.com',
      password: 'secret',
    });

    expect(user).toBeNull();
  });

  it('throws generic Authentication failed when API errors with message', async () => {
    await importRoute();

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    } as any);

    await expect(
      getCredsProvider().authorize({
        email: 'john@example.com',
        password: 'bad',
      })
    ).rejects.toThrow('Authentication failed');
  });

  it('throws generic Authentication failed when credentials are missing', async () => {
    await importRoute();

    await expect(getCredsProvider().authorize({ email: '', password: '' })).rejects.toThrow(
      'Authentication failed'
    );
  });

  it('throws generic Authentication failed when fetch throws', async () => {
    await importRoute();

    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

    await expect(
      getCredsProvider().authorize({
        email: 'john@example.com',
        password: 'secret',
      })
    ).rejects.toThrow('Authentication failed');
  });
});

describe('callbacks', () => {
  it('jwt callback sets id and accessToken from user', async () => {
    await importRoute();

    const { jwt } = capturedConfig!.callbacks!;
    const token = await jwt!({
      token: {} as any,
      user: { id: 'u2', accessToken: 'tok' } as any,
      account: null as any,
      profile: undefined,
      trigger: 'signIn',
      session: null as any,
    });

    expect(token).toEqual({ id: 'u2', accessToken: 'tok' });
  });

  it('jwt callback keeps token intact without user', async () => {
    await importRoute();

    const { jwt } = capturedConfig!.callbacks!;
    const token = await jwt!({
      token: { id: 'u3', accessToken: 'prev' } as any,
      user: undefined as any,
      account: null as any,
      profile: undefined,
      trigger: 'signIn',
      session: null as any,
    });

    expect(token).toEqual({ id: 'u3', accessToken: 'prev' });
  });

  it('session callback copies id and accessToken from token', async () => {
    await importRoute();

    const { session } = capturedConfig!.callbacks!;
    const out = await session!({
      session: { user: { id: '' } } as any,
      token: { id: 'u9', accessToken: 'tok99' } as any,
      user: { id: 'u9' } as any,
      newSession: null as any,
      trigger: 'update',
    } as any);

    expect((out as any).accessToken).toBe('tok99');
    expect((out as any).user.id).toBe('u9');
  });

  it('session callback tolerates missing user object', async () => {
    await importRoute();

    const { session } = capturedConfig!.callbacks!;
    const out = await session!({
      session: {} as any,
      token: { id: 'u7', accessToken: 'tok7' } as any,
      user: { id: 'u7' } as any,
      newSession: null as any,
      trigger: 'update',
    } as any);

    expect((out as any).accessToken).toBe('tok7');
  });
});
