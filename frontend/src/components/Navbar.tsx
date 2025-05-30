'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/hooks/useAuth';
import MotismoLogo from '@root/assets/images/motismo_logo.webp';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { session, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const login = () => {
    router.push('/auth');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <Image src={MotismoLogo} alt="Motismo Logo" width={75} height={75} />

      <div className={`navigation ${isMenuOpen ? 'open' : ''}`}>
        <Link
          className={pathname === '/' ? 'active' : ''}
          href="/"
          onClick={() => setIsMenuOpen(false)}
        >
          Home
        </Link>
        <Link
          className={pathname === '/about' ? 'active' : ''}
          href="/about"
          onClick={() => setIsMenuOpen(false)}
        >
          About
        </Link>
        <Link
          className={pathname === '/contact' ? 'active' : ''}
          href="/contact"
          onClick={() => setIsMenuOpen(false)}
        >
          Contact
        </Link>
      </div>

      <div className="navbar-brand">
        <div className={`auth-buttons ${isMenuOpen ? 'open' : ''}`}>
          {session ? (
            <button className="btn btn-secondary" onClick={handleLogout}>
              {t('navigation.logout')}
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={login}>
              {t('navigation.login')}
            </button>
          )}
        </div>
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        </button>
      </div>
    </nav>
  );
};
