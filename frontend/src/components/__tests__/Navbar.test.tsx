/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';

import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} data-testid="logo" {...props} />;
  };
});

jest.mock('@/hooks/useAuth');

describe('Navbar component', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  it('should render logo', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
      logout: mockLogout,
    });

    render(<Navbar />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('alt', 'Motismo Logo');
  });

  it('should render navigation links', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: {
        user: { role: 'Teacher' },
      },
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Mon espace')).toBeInTheDocument();
    expect(screen.getByText('Accueil')).toHaveAttribute('href', '/');
    expect(screen.getByText('Mon espace')).toHaveAttribute('href', '/profile');
  });

  it('should show login button when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByText('Se connecter')).toBeInTheDocument();
    expect(screen.queryByText('Se déconnecter')).not.toBeInTheDocument();
  });

  it('should show logout button when user is authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: { user: { email: 'test@example.com' } },
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByText('Se déconnecter')).toBeInTheDocument();
    expect(screen.queryByText('Se connecter')).not.toBeInTheDocument();
  });

  it('should navigate to auth page when login button is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: null,
      logout: mockLogout,
    });

    render(<Navbar />);

    const loginButton = screen.getByText('Se connecter');
    fireEvent.click(loginButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/auth');
  });

  it('should logout and navigate to home when logout button is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: { user: { email: 'test@example.com' } },
      logout: mockLogout,
    });

    render(<Navbar />);

    const logoutButton = screen.getByText('Se déconnecter');
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

    const hamburgerButton = screen.getByLabelText('Basculer le menu');

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

    const hamburgerButton = screen.getByLabelText('Basculer le menu');
    const homeLink = screen.getByText('Accueil');

    fireEvent.click(hamburgerButton);
    expect(screen.getByText('Accueil').closest('.navigation')).toHaveClass('open');

    fireEvent.click(homeLink);
    expect(screen.getByText('Accueil').closest('.navigation')).not.toHaveClass('open');
  });

  it('should show active state for current page', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: {
        user: { role: 'Teacher' },
      },
      logout: mockLogout,
    });
    (usePathname as jest.Mock).mockReturnValue('/profile');

    render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByText('Mon espace')).toHaveClass('active');
    });

    expect(screen.getByText('Accueil')).not.toHaveClass('active');
  });

  it('should show active state for home page', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: {
        user: { role: 'Teacher' },
      },
      logout: mockLogout,
    });
    (usePathname as jest.Mock).mockReturnValue('/');

    render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByText('Accueil')).toHaveClass('active');
    });

    expect(screen.getByText('Mon espace')).not.toHaveClass('active');
  });

  it('should have correct CSS classes', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: {
        user: { role: 'Teacher' },
      },
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByRole('navigation')).toHaveClass('navbar');
    expect(screen.getByText('Accueil').closest('.navigation')).toBeInTheDocument();
    expect(screen.getByText('Se déconnecter').closest('.auth-buttons')).toBeInTheDocument();
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

  it('should close mobile menu when Mon espace link is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      session: {
        user: { role: 'Teacher' },
      },
      logout: mockLogout,
    });

    render(<Navbar />);

    const hamburgerButton = screen.getByLabelText('Basculer le menu');
    const profileLink = screen.getByText('Mon espace');

    fireEvent.click(hamburgerButton);
    expect(screen.getByText('Accueil').closest('.navigation')).toHaveClass('open');

    fireEvent.click(profileLink);
    expect(screen.getByText('Accueil').closest('.navigation')).not.toHaveClass('open');
  });
});
