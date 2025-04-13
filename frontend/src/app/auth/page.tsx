'use client';

import LoginIcon from '@mui/icons-material/LoginRounded';
import PersonAddIcon from '@mui/icons-material/PersonAddRounded';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityIcon from '@mui/icons-material/VisibilityRounded';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AuthPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <nav className="auth-nav">
          <Link href="/auth" className="nav-item active">
            <LoginIcon />
            {t('auth.login')}
          </Link>
          <Link href="/auth/register" className="nav-item">
            <PersonAddIcon />
            {t('auth.register')}
          </Link>
        </nav>

        <main className="auth-content">
          <h1 className="auth-title">{t('auth.welcome')}</h1>
          <p className="auth-description">{t('auth.loginDescription')}</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="form-input password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <VisibilityIcon color="primary" />
                  ) : (
                    <VisibilityOffIcon color="primary" />
                  )}
                </button>
              </div>
            </div>

            <div className="forgot-password-container">
              <Link href="/auth/forgot-password" className="forgot-password">
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <button type="submit" className="btn btn-colored">
              {t('auth.login')}
            </button>
          </form>

          <div className="auth-divider">
            <span className="divider-text">{t('auth.orContinueWith')}</span>
          </div>

          <div className="social-login">
            <button className="social-button">
              <span className="google-icon">G</span>
              Google
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
