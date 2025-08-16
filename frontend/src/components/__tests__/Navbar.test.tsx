/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/hooks/useAuth';

import { Navbar } from '../Navbar';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href, onClick, className }: any) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    );
  };
});

jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height }: any) {
    return <img src={src} alt={alt} width={width} height={height} data-testid="logo" />;
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@root/assets/images/motismo_logo.webp', () => 'mock-logo-path');

const mockRouter = {
  push: jest.fn(),
};

const mockLogout = jest.fn();

describe('Navbar component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  it('should render navbar with logo', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByTestId('logo')).toHaveAttribute('alt', 'Motismo Logo');
    expect(screen.getByTestId('logo')).toHaveAttribute('width', '75');
    expect(screen.getByTestId('logo')).toHaveAttribute('height', '75');
  });

  it('should render navigation links', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Accueil')).toHaveAttribute('href', '/');
    expect(screen.getByText('Dashboard')).toHaveAttribute('href', '/profile');
  });

  it('should show login button when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByText('navigation.login')).toBeInTheDocument();
    expect(screen.queryByText('navigation.logout')).not.toBeInTheDocument();
  });

  it('should show logout button when user is authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: { user: { email: 'test@example.com' } },
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByText('navigation.logout')).toBeInTheDocument();
    expect(screen.queryByText('navigation.login')).not.toBeInTheDocument();
  });

  it('should navigate to auth page when login button is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
      logout: mockLogout,
    });

    render(<Navbar />);

    const loginButton = screen.getByText('navigation.login');
    fireEvent.click(loginButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/auth');
  });

  it('should logout and navigate to home when logout button is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: { user: { email: 'test@example.com' } },
      logout: mockLogout,
    });

    render(<Navbar />);

    const logoutButton = screen.getByText('navigation.logout');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('should toggle mobile menu when hamburger button is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
      logout: mockLogout,
    });

    render(<Navbar />);

    const hamburgerButton = screen.getByLabelText('Toggle menu');

    expect(screen.getByText('Accueil').closest('.navigation')).not.toHaveClass('open');

    fireEvent.click(hamburgerButton);
    expect(screen.getByText('Accueil').closest('.navigation')).toHaveClass('open');

    fireEvent.click(hamburgerButton);
    expect(screen.getByText('Accueil').closest('.navigation')).not.toHaveClass('open');
  });

  it('should close mobile menu when navigation link is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
      logout: mockLogout,
    });

    render(<Navbar />);

    const hamburgerButton = screen.getByLabelText('Toggle menu');
    const homeLink = screen.getByText('Accueil');

    fireEvent.click(hamburgerButton);
    expect(screen.getByText('Accueil').closest('.navigation')).toHaveClass('open');

    fireEvent.click(homeLink);
    expect(screen.getByText('Accueil').closest('.navigation')).not.toHaveClass('open');
  });

  it('should show active state for current page', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
      logout: mockLogout,
    });
    (usePathname as jest.Mock).mockReturnValue('/profile');

    render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toHaveClass('active');
    });

    expect(screen.getByText('Accueil')).not.toHaveClass('active');
  });

  it('should show active state for home page', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
      logout: mockLogout,
    });
    (usePathname as jest.Mock).mockReturnValue('/');

    render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByText('Accueil')).toHaveClass('active');
    });

    expect(screen.getByText('Dashboard')).not.toHaveClass('active');
  });

  it('should have correct CSS classes', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByRole('navigation')).toHaveClass('navbar');
    expect(screen.getByText('Accueil').closest('.navigation')).toBeInTheDocument();
    expect(screen.getByText('navigation.login').closest('.auth-buttons')).toBeInTheDocument();
  });

  it('should render hamburger menu lines', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
      logout: mockLogout,
    });

    render(<Navbar />);

    const hamburgerLines = screen
      .getAllByRole('generic')
      .filter(el => el.className.includes('hamburger-line'));
    expect(hamburgerLines).toHaveLength(3);
  });

  it('should close mobile menu when Dashboard link is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
      logout: mockLogout,
    });

    render(<Navbar />);

    const hamburgerButton = screen.getByLabelText('Toggle menu');
    const dashboardLink = screen.getByText('Dashboard');

    fireEvent.click(hamburgerButton);
    expect(screen.getByText('Accueil').closest('.navigation')).toHaveClass('open');

    fireEvent.click(dashboardLink);
    expect(screen.getByText('Accueil').closest('.navigation')).not.toHaveClass('open');
  });
});
