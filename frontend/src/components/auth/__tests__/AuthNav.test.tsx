import { render, screen, fireEvent } from '@testing-library/react';
import AuthNav from '../AuthNav';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('AuthNav', () => {
  const defaultProps = {
    activeTab: 'login' as const,
    onTabChange: jest.fn(),
  };

  it('should render both login and register buttons', () => {
    render(<AuthNav {...defaultProps} />);
    
    expect(screen.getByText('auth.login')).toBeInTheDocument();
    expect(screen.getByText('auth.register')).toBeInTheDocument();
  });

  it('should have active class on login button when activeTab is login', () => {
    render(<AuthNav {...defaultProps} activeTab="login" />);
    
    const loginButton = screen.getByText('auth.login').closest('button');
    expect(loginButton).toHaveClass('active');
  });

  it('should have active class on register button when activeTab is register', () => {
    render(<AuthNav {...defaultProps} activeTab="register" />);
    
    const registerButton = screen.getByText('auth.register').closest('button');
    expect(registerButton).toHaveClass('active');
  });

  it('should call onTabChange when login button is clicked', () => {
    const onTabChange = jest.fn();
    render(<AuthNav {...defaultProps} onTabChange={onTabChange} />);
    
    fireEvent.click(screen.getByText('auth.login'));
    
    expect(onTabChange).toHaveBeenCalledWith('login');
  });

  it('should call onTabChange when register button is clicked', () => {
    const onTabChange = jest.fn();
    render(<AuthNav {...defaultProps} onTabChange={onTabChange} />);
    
    fireEvent.click(screen.getByText('auth.register'));
    
    expect(onTabChange).toHaveBeenCalledWith('register');
  });
}); 