/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import LoginForm from '../LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/utils/toast';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/utils/toast', () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/components/forms/Input', () => {
  return function MockInput({ label, error, registration, isPassword, ...props }: any) {
    return (
      <div>
        {label && <label>{label}</label>}
        <input
          {...registration}
          {...props}
          type={isPassword ? 'password' : 'text'}
          data-testid={`input-${label?.toLowerCase()}`}
        />
        {error && <span className="error">{error}</span>}
      </div>
    );
  };
});

jest.mock('@mui/icons-material/EmailRounded', () => {
  return function MockEmailIcon() {
    return <div data-testid="email-icon" />;
  };
});

jest.mock('@mui/icons-material/VpnKeyRounded', () => {
  return function MockKeyIcon() {
    return <div data-testid="key-icon" />;
  };
});

const mockRouter = {
  push: jest.fn(),
};

const mockLogin = jest.fn();

describe('LoginForm component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });
  });

  it('should render login form with all fields', () => {
    render(<LoginForm />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByTestId('input-email')).toBeInTheDocument();
    expect(screen.getByTestId('input-mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    mockLogin.mockResolvedValue(true);

    render(<LoginForm />);

    const emailInput = screen.getByTestId('input-email');
    const passwordInput = screen.getByTestId('input-mot de passe');
    const submitButton = screen.getByRole('button', { name: 'Se connecter' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    await waitFor(() => {
      expect(showToast.success).toHaveBeenCalledWith('auth.loginSuccess');
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });

  it('should handle login failure', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValue({
      data: { message: errorMessage },
    });

    render(<LoginForm />);

    const emailInput = screen.getByTestId('input-email');
    const passwordInput = screen.getByTestId('input-mot de passe');
    const submitButton = screen.getByRole('button', { name: 'Se connecter' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    });

    await waitFor(() => {
      expect(showToast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('should handle login failure without error message', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));

    render(<LoginForm />);

    const emailInput = screen.getByTestId('input-email');
    const passwordInput = screen.getByTestId('input-mot de passe');
    const submitButton = screen.getByRole('button', { name: 'Se connecter' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(showToast.error).toHaveBeenCalledWith(undefined);
    });
  });

  it('should not redirect when login returns false', async () => {
    mockLogin.mockResolvedValue(false);

    render(<LoginForm />);

    const emailInput = screen.getByTestId('input-email');
    const passwordInput = screen.getByTestId('input-mot de passe');
    const submitButton = screen.getByRole('button', { name: 'Se connecter' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    await waitFor(() => {
      expect(showToast.success).not.toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});