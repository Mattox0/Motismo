import { signIn, signOut, useSession } from 'next-auth/react';
import { renderHook, act } from '@testing-library/react';

import { useAuth } from '../useAuth';
import { showToast } from '@/utils/toast';

const createSignInResponse = (error: string | null, ok: boolean) => ({
  error,
  ok,
  status: 200,
  url: null,
});

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock toast
jest.mock('@/utils/toast', () => ({
  showToast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('useAuth', () => {
  const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
  const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
  const mockShowToast = showToast as jest.Mocked<typeof showToast>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    } as any);
  });

  describe('session and status', () => {
    it('should return session and status from useSession', () => {
      const mockSession = { user: { id: '123', email: 'test@example.com' }, expires: '2024-12-31' };
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn(),
      } as any);

      const { result } = renderHook(() => useAuth());

      expect(result.current.session).toBe(mockSession);
      expect(result.current.status).toBe('authenticated');
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      mockSignIn.mockResolvedValue(createSignInResponse(null, true) as any);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const loginResult = await result.current.login('test@example.com', 'password123');
        expect(loginResult).toEqual(createSignInResponse(null, true));
      });

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });

    it('should handle login error and show toast', async () => {
      mockSignIn.mockResolvedValue({ error: 'Invalid credentials', ok: false, status: 200, url: null });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const loginResult = await result.current.login('test@example.com', 'wrongpassword');
        expect(loginResult).toEqual({ error: 'Invalid credentials', ok: false, status: 200, url: null });
      });

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'wrongpassword',
        redirect: false,
      });
      expect(mockShowToast.error).toHaveBeenCalledWith('auth.errors.invalidCredentials');
    });

    it('should handle login exception', async () => {
      const error = new Error('Network error');
      mockSignIn.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await expect(result.current.login('test@example.com', 'password123')).rejects.toThrow('Network error');
      });
    });
  });

  describe('register', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
      image: new File([''], 'test.jpg', { type: 'image/jpeg' }),
    };

    it('should successfully register and auto-login', async () => {
      const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({ message: 'Success' }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      mockSignIn.mockResolvedValue({ error: null, ok: true });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const registerResult = await result.current.register(mockUserData);
        expect(registerResult).toEqual({ error: null, ok: true });
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });

    it('should handle registration without image', async () => {
      const userDataWithoutImage = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({ message: 'Success' }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      mockSignIn.mockResolvedValue({ error: null, ok: true });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const registerResult = await result.current.register(userDataWithoutImage);
        expect(registerResult).toEqual({ error: null, ok: true });
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    it('should handle registration failure', async () => {
      const mockResponse = { 
        ok: false, 
        json: jest.fn().mockResolvedValue({ message: 'Email already exists' }) 
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await expect(result.current.register(mockUserData)).rejects.toThrow('Email already exists');
      });

      expect(mockShowToast.error).toHaveBeenCalledWith('Email already exists');
    });

    it('should handle registration failure with default error message', async () => {
      const mockResponse = { 
        ok: false, 
        json: jest.fn().mockRejectedValue(new Error('JSON parse error')) 
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await expect(result.current.register(mockUserData)).rejects.toThrow('Registration failed');
      });

      expect(mockShowToast.error).toHaveBeenCalledWith('auth.errors.registrationFailed');
    });

    it('should handle auto-login failure after registration', async () => {
      const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({ message: 'Success' }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      mockSignIn.mockResolvedValue({ error: 'Auto-login failed', ok: false });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await expect(result.current.register(mockUserData)).rejects.toThrow('Auto-login after registration failed');
      });
    });

    it('should handle network error during registration', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await expect(result.current.register(mockUserData)).rejects.toThrow('Network error');
      });
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      mockSignOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockSignOut).toHaveBeenCalledWith({ redirect: false });
    });

    it('should handle logout error', async () => {
      const error = new Error('Logout failed');
      mockSignOut.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await expect(result.current.logout()).rejects.toThrow('Logout failed');
      });

      expect(mockSignOut).toHaveBeenCalledWith({ redirect: false });
    });
  });

  describe('FormData creation', () => {
    it('should create FormData with all user data', async () => {
      const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({ message: 'Success' }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      mockSignIn.mockResolvedValue({ error: null, ok: true });

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        image: new File([''], 'test.jpg', { type: 'image/jpeg' }),
      };

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register(userData);
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const formData = fetchCall[1].body as FormData;

      expect(formData.get('email')).toBe('test@example.com');
      expect(formData.get('password')).toBe('password123');
      expect(formData.get('username')).toBe('testuser');
      expect(formData.get('image')).toBeInstanceOf(File);
    });

    it('should handle undefined values in FormData', async () => {
      const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({ message: 'Success' }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      mockSignIn.mockResolvedValue({ error: null, ok: true });

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        image: undefined,
      };

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register(userData);
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const formData = fetchCall[1].body as FormData;

      expect(formData.get('email')).toBe('test@example.com');
      expect(formData.get('password')).toBe('password123');
      expect(formData.get('username')).toBe('testuser');
      expect(formData.get('image')).toBeNull();
    });
  });
}); 