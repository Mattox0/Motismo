'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/hooks/useAuth';
import { IUserRole } from '@/types/IUserRole';
import MotismoLogo from '@root/assets/images/motismo_logo.webp';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { session, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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
      <div className="navbar-logo">
        <Image src={MotismoLogo} alt="Motismo Logo" width={75} height={75} />
      </div>

      <div className={`navigation ${isMenuOpen ? 'open' : ''}`}>
        <Link
          className={isHydrated && pathname === '/' ? 'active' : ''}
          href="/"
          onClick={() => setIsMenuOpen(false)}
        >
          Accueil
        </Link>
        <Link
          className={isHydrated && pathname === '/profile' ? 'active' : ''}
          href="/profile"
          onClick={() => setIsMenuOpen(false)}
        >
          Dashboard
        </Link>
        <Link
          className={isHydrated && pathname === '/contact' ? 'active' : ''}
          href="/contact"
          onClick={() => setIsMenuOpen(false)}
        >
          Contact
        </Link>
        {session?.user.role === IUserRole.Teacher && (
          <Link
            className={isHydrated && pathname === '/class' ? 'active' : ''}
            href="/class"
            onClick={() => setIsMenuOpen(false)}
          >
            Mes classes
          </Link>
        )}
      </div>

      <div className="navbar-brand">
        <div className={`auth-buttons ${isMenuOpen ? 'open' : ''}`}>
          {isHydrated ? (
            session ? (
              <button className="btn btn-secondary" onClick={handleLogout}>
                {t('navigation.logout')}
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={login}>
                {t('navigation.login')}
              </button>
            )
          ) : (
            <button className="btn btn-secondary" style={{ visibility: 'hidden' }}>
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
