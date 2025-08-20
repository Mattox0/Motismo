/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent } from '@testing-library/react';

import AuthPage from '../page';

jest.mock('@/components/auth/AuthNav', () => {
  return function MockAuthNav({ activeTab, onTabChange }: any) {
    return (
      <div data-testid="auth-nav">
        <button onClick={() => onTabChange('login')} data-testid="login-tab">
          Login
        </button>
        <button onClick={() => onTabChange('register')} data-testid="register-tab">
          Register
        </button>
        <span data-testid="active-tab">{activeTab}</span>
      </div>
    );
  };
});

jest.mock('@/components/auth/SocialLogin', () => {
  return function MockSocialLogin() {
    return <div data-testid="social-login">Social Login</div>;
  };
});

jest.mock('@/components/Divider', () => {
  return function MockDivider({ text }: { text: string }) {
    return <div data-testid="divider">{text}</div>;
  };
});

jest.mock('@/components/forms/LoginForm', () => {
  return function MockLoginForm() {
    return <div data-testid="login-form">Login Form</div>;
  };
});

jest.mock('@/components/forms/RegisterForm', () => {
  return function MockRegisterForm() {
    return <div data-testid="register-form">Register Form</div>;
  };
});

jest.mock('@/layout/AuthLayout', () => {
  return function MockAuthLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="auth-layout">{children}</div>;
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('AuthPage', () => {
  it('should render with login tab active by default', () => {
    render(<AuthPage />);

    expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
    expect(screen.getByTestId('auth-nav')).toBeInTheDocument();
    expect(screen.getByTestId('active-tab')).toHaveTextContent('login');
  });

  it('should display login title and description when login tab is active', () => {
    render(<AuthPage />);

    expect(screen.getByText('auth.welcome')).toBeInTheDocument();
    expect(screen.getByText('auth.loginDescription')).toBeInTheDocument();
  });

  it('should switch to register tab when register button is clicked', () => {
    render(<AuthPage />);

    fireEvent.click(screen.getByTestId('register-tab'));

    expect(screen.getByTestId('active-tab')).toHaveTextContent('register');
    expect(screen.getByText('auth.registerWelcome')).toBeInTheDocument();
    expect(screen.getByText('auth.registerDescription')).toBeInTheDocument();
  });

  it('should switch back to login tab when login button is clicked', () => {
    render(<AuthPage />);

    fireEvent.click(screen.getByTestId('register-tab'));
    expect(screen.getByTestId('active-tab')).toHaveTextContent('register');

    fireEvent.click(screen.getByTestId('login-tab'));
    expect(screen.getByTestId('active-tab')).toHaveTextContent('login');
  });

  it('should render login form with active class when login tab is active', () => {
    render(<AuthPage />);

    const loginWrapper = screen.getByTestId('login-form').closest('.auth-form-wrapper');
    expect(loginWrapper).toHaveClass('login', 'active');

    const registerWrapper = screen.getByTestId('register-form').closest('.auth-form-wrapper');
    expect(registerWrapper).toHaveClass('register');
    expect(registerWrapper).not.toHaveClass('active');
  });

  it('should render register form with active class when register tab is active', () => {
    render(<AuthPage />);

    fireEvent.click(screen.getByTestId('register-tab'));

    const loginWrapper = screen.getByTestId('login-form').closest('.auth-form-wrapper');
    expect(loginWrapper).toHaveClass('login');
    expect(loginWrapper).not.toHaveClass('active');

    const registerWrapper = screen.getByTestId('register-form').closest('.auth-form-wrapper');
    expect(registerWrapper).toHaveClass('register', 'active');
  });

  it('should render auth content with title and description', () => {
    render(<AuthPage />);

    expect(screen.getByText('auth.welcome')).toBeInTheDocument();
    expect(screen.getByText('auth.loginDescription')).toBeInTheDocument();
  });

  it('should render all form components', () => {
    render(<AuthPage />);

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });
});
